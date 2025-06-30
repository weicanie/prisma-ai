import { Document } from '@langchain/core/documents';
import { Embeddings } from '@langchain/core/embeddings';
import { PineconeStore } from '@langchain/pinecone';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone, ServerlessSpecCloudEnum } from '@pinecone-database/pinecone';
import { EmbeddingModelService } from './embedding-model.service';
/**pinecone云向量数据库的使用
 *  储存：带有向量和数据的record -> index（数据库,需要预先建立!需要VPN!）
 *  取用：index -> retriever -> record
 * */

const serverlessConfig = {
	cloud: 'aws' as ServerlessSpecCloudEnum,
	region: 'us-east-1'
};

@Injectable()
export class VectorStoreService {
	public pinecone: Pinecone;

	private logger = new Logger(VectorStoreService.name);

	constructor(
		private configService: ConfigService,
		public embeddingModelService: EmbeddingModelService
	) {
		// 初始化 Pinecone 客户端
		this.pinecone = new Pinecone({
			apiKey: this.configService.get('PINECONE_API_KEY')!
		});
		this.logger.log('Pinecone 客户端初始化成功');
	}
	/**
	 * 创建空的向量索引
	 * @param indexName 索引名
	 * @param dimension 向量维度
	 * @returns {Promise<void>}
	 */
	async createEmptyIndex(indexName: string, dimension: number): Promise<void> {
		try {
			await this.pinecone.createIndex({
				name: indexName,
				dimension: dimension,
				metric: 'cosine',
				spec: {
					serverless: {
						cloud: serverlessConfig.cloud,
						region: serverlessConfig.region
					}
				}
			});
			this.logger.log(`成功创建索引: ${indexName}, 维度: ${dimension}`);
		} catch (error) {
			this.logger.error(`创建索引 ${indexName} 失败:`, error);
			throw new Error(`创建索引失败: ${(error as Error).message}`);
		}
	}

	/**
	 * 文档向量化并储存到已有索引
	 * @param documents 要添加的文档数组
	 * @param embeddings 用于向量化的嵌入模型
	 * @param namespace 命名空间
	 */
	async addDocumentsToIndex(
		documents: Document[],
		indexName: string,
		embeddings: Embeddings,
		namespace?: string
	): Promise<void> {
		try {
			if (!(await this.indexExists(indexName))) {
				throw new Error(`索引 ${indexName} 不存在，请先创建索引`);
			}
			const index = this.pinecone.Index(indexName);
			const pineconeStore = await PineconeStore.fromExistingIndex(embeddings, {
				pineconeIndex: index,
				namespace
			});
			//会去调用embeddings的embedDocuments方法
			await pineconeStore.addDocuments(documents);
			this.logger.log(`成功添加 ${documents.length} 个文档到索引 ${indexName}`);
		} catch (error) {
			const errorMessage = (error as Error).message;
			this.logger.error(`向索引 ${indexName} 添加文档失败:`, error);

			if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
				throw new Error(
					`网络连接失败: 无法连接到 Pinecone 或 HuggingFace 服务器。请检查网络连接或VPN设置。`
				);
			} else if (errorMessage.includes('timeout')) {
				throw new Error(`操作超时: 网络连接不稳定或文档过大，请重试或检查VPN连接。`);
			} else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
				throw new Error(`认证失败: 请检查 PINECONE_API_KEY 或 HUGGINGFACE_API_KEY 是否正确配置。`);
			}

			throw new Error(`添加文档失败: ${errorMessage}`);
		}
	}

	/**
	 * 获取向量数据库检索器
	 * @param indexName 索引名
	 * @param embeddings 用于向量化的嵌入模型
	 * @param config 检索器配置
	 * @returns 检索器
	 */
	async getRetrieverOfIndex(
		indexName: string,
		embeddings: Embeddings,
		topK: number = 3,
		namespace?: string
	) {
		const index = this.pinecone.Index(indexName);
		const vectorStore = new PineconeStore(embeddings, { pineconeIndex: index, namespace });

		//FIXME 能返回元数据?
		const retriever = vectorStore.asRetriever(topK);
		return retriever;
	}

	/**
	 * 检查指定名称的向量索引是否存在
	 * @param indexName 索引名
	 * @returns {Promise<boolean>} 是否存在的布尔值
	 */
	async indexExists(indexName: string): Promise<boolean> {
		let retryCount = 0;
		const maxRetries = 3;

		while (retryCount < maxRetries) {
			try {
				const indexes = (await this.pinecone.listIndexes()).indexes;
				if (!indexes || indexes.length === 0) {
					return false;
				}
				return indexes.some(index => index.name === indexName);
			} catch (error) {
				retryCount++;
				const errorMessage = (error as Error).message;

				if (retryCount >= maxRetries) {
					this.logger.error(`检查索引 ${indexName} 是否存在时出错 (最终失败):`, error);

					// 提供详细的网络错误诊断
					if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
						throw new Error(`网络连接失败: 无法连接到 Pinecone 服务器。请检查网络连接或VPN设置。`);
					} else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
						throw new Error(`认证失败: 请检查 PINECONE_API_KEY 是否正确配置。`);
					} else if (errorMessage.includes('timeout')) {
						throw new Error(`连接超时: 网络连接不稳定，请检查网络状况或尝试使用VPN。`);
					}

					throw error;
				}

				this.logger.warn(`检查索引失败，正在重试 (${retryCount}/${maxRetries}):`, errorMessage);
				// 指数退避重试
				await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
			}
		}

		return false;
	}

	/**
	 * 获取本地嵌入模型实例
	 * @returns {HuggingFaceTransformersEmbeddings} 本地 SBERT 模型实例
	 */
	getLocalEmbeddings(): Embeddings {
		return this.embeddingModelService;
	}
}
