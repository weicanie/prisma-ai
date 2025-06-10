import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';
import * as fs from 'fs';
/**pinecone云向量数据库的使用
 *  储存：带有向量和数据的record -> index（数据库,需要预先建立!需要VPN!）
 *  取用：index -> retriever -> record
 * */

enum pineconeIndexs {
	KYJ = 'my-index', //《孔乙己》
	QIU = 'qiu-index' //《球状闪电》
}

interface RetriverConfig {
	k: number;
	verbose?: boolean;
}
//FIXME 需要VPN,得内置代理(查pinecone文档？)
@Injectable()
export class VectorStoreService {
	private pinecone: Pinecone;
	constructor(private configService: ConfigService) {
		this.pinecone = new Pinecone({
			apiKey: this.configService.get('PINECONE_API_KEY')!
		});
	}

	async embedAndStoreToIndex(
		splitDocs: Document[],
		embeddings: OpenAIEmbeddings,
		indexAlias: string
	) {
		if (!pineconeIndexs[indexAlias]) {
			throw new Error(`Index ${indexAlias} does not exist`);
		}
		const indexName = pineconeIndexs[indexAlias];
		await PineconeStore.fromDocuments(splitDocs, embeddings, {
			pineconeIndex: this.pinecone.Index(indexName)
		});
	}

	async getRetrieverOfIndex(
		indexAlias: string,
		embeddings: OpenAIEmbeddings,
		config: RetriverConfig = { k: 3, verbose: false }
	) {
		if (!pineconeIndexs[indexAlias]) {
			throw new Error(`Index ${indexAlias} does not exist`);
		}
		const indexName = pineconeIndexs[indexAlias];
		const index = this.pinecone.Index(indexName);
		const vectorStore = new PineconeStore(embeddings, { pineconeIndex: index });

		const retriever = vectorStore.asRetriever(config.k);
		return retriever;
	}

	/* 
		为了支持llm缓存层
	*/
	/**
	 * 检查指定名称的向量索引是否存在
	 * @param indexAlias 索引别名标识符（如QIU或自定义索引名）
	 * @returns {Promise<boolean>} 是否存在的布尔值
	 * @description 通过Pinecone API检查索引是否已创建
	 */
	async indexExists(indexAlias: string): Promise<boolean> {
		try {
			// 获取实际索引名称（如果是别名）
			const indexName = pineconeIndexs[indexAlias] || indexAlias;

			// 获取所有索引列表
			const indexes = (await this.pinecone.listIndexes()).indexes;

			// 检查指定索引是否在列表中
			if (!indexes || indexes.length === 0) {
				console.warn(`没有找到任何索引，检查索引 ${indexAlias} 是否存在时出错`);
				return false;
			} else return indexes.some(index => index.name === indexName);
		} catch (error) {
			console.error(`检查索引 ${indexAlias} 是否存在时出错:`, error);
			return false; // 出错时默认返回不存在
		}
	}

	/**
	 * 创建空的向量索引
	 * @param indexAlias 索引别名或直接索引名
	 * @param embeddings 用于向量化的嵌入模型
	 * @returns {Promise<void>}
	 * @description 创建一个新的Pinecone索引，配置维度与模型匹配
	 */
	async createEmptyIndex(indexAlias: string, embeddings: OpenAIEmbeddings): Promise<void> {
		try {
			// 确定索引名称
			const indexName = pineconeIndexs[indexAlias] || indexAlias;

			// 确定向量维度 - OpenAI嵌入通常为1536维
			const dimension = 1536;

			// 创建索引
			await this.pinecone.createIndex({
				name: indexName,
				dimension: dimension,
				metric: 'cosine', // 使用余弦相似度计算
				spec: {
					serverless: {
						cloud: 'aws',
						region: 'us-west-2' // 可以根据需要替换为其他区域
					}
				}
			});

			console.log(`成功创建索引: ${indexName}, 维度: ${dimension}`);
		} catch (error) {
			console.error(`创建索引 ${indexAlias} 失败:`, error);
			throw new Error(`创建索引失败: ${error.message}`);
		}
	}

	/**
	 * 将文档添加到现有向量索引
	 * @param documents 要添加的文档数组
	 * @param indexAlias 索引别名或索引名
	 * @param embeddings 用于向量化的嵌入模型
	 * @returns {Promise<void>}
	 * @description 将文档向量化并添加到指定索引，保留元数据
	 */
	async addDocumentsToIndex(
		documents: Document[],
		indexAlias: string,
		embeddings: OpenAIEmbeddings
	): Promise<void> {
		try {
			// 确定索引名称
			const indexName = pineconeIndexs[indexAlias] || indexAlias;

			// 检查索引是否存在
			if (!(await this.indexExists(indexName))) {
				throw new Error(`索引 ${indexName} 不存在，请先创建索引`);
			}

			// 获取Pinecone索引实例
			const index = this.pinecone.Index(indexName);

			// 使用PineconeStore添加文档
			const pineconeStore = await PineconeStore.fromExistingIndex(embeddings, {
				pineconeIndex: index
			});
			await pineconeStore.addDocuments(documents);

			console.log(`成功添加 ${documents.length} 个文档到索引 ${indexName}`);
		} catch (error) {
			console.error(`向索引 ${indexAlias} 添加文档失败:`, error);
			throw new Error(`添加文档失败: ${error.message}`);
		}
	}
}

/**
 * @param directory 相对于项目根目录的路径
 * @param filename
 * @param dataObj
 * @description 将数据对象以json格式写入文件
 */
export function saveToFile(directory: string = './db', filename: string, dataObj: any) {
	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory, { recursive: true });
	}
	filename = filename.replace('.json', '');
	const filePath = `${directory}/${filename}.json`;
	fs.writeFile(filePath, JSON.stringify(dataObj), err => {
		if (err) {
			console.error(`Error writing ${filename}.json:`, err);
		} else {
			console.log('${filename}.json written successfully:', filePath);
		}
	});
}
