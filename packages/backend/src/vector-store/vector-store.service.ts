import { Document } from '@langchain/core/documents';
import { Embeddings } from '@langchain/core/embeddings';
import { PineconeStore } from '@langchain/pinecone';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone, ServerlessSpecCloudEnum } from '@pinecone-database/pinecone';
import * as fs from 'fs';
import { EmbeddingModelService } from './embedding-model.service';
/**pinecone云向量数据库的使用
 *  储存：带有向量和数据的record -> index（数据库,需要预先建立!需要VPN!）
 *  取用：index -> retriever -> record
 * */

export enum IndexMap {
  JOBS = 'jobs-index', // 岗位索引
}

const serverlessConfig = {
  cloud: 'aws' as ServerlessSpecCloudEnum,
  region: 'us-east-1',
};

interface RetriverConfig {
  k: number;
  verbose?: boolean;
}

@Injectable()
export class VectorStoreService implements OnModuleInit {
  public pinecone: Pinecone;

  private logger = new Logger(VectorStoreService.name);

  constructor(
    private configService: ConfigService,
    private embeddingModelService: EmbeddingModelService,
  ) {
    // 初始化 Pinecone 客户端
    this.pinecone = new Pinecone({
      apiKey: this.configService.get('PINECONE_API_KEY')!,
    });
    this.logger.log('Pinecone 客户端初始化成功');
  }

  /**
   * 确保要用到的向量数据库索引存在, 不存在则创建
   */
  async onModuleInit() {
    try {
      this.logger.log('正在检查 Pinecone 连接...');
      const jobsIndexExists = await this.indexExists(IndexMap.JOBS);
      if (!jobsIndexExists) {
        console.log(`索引 '${IndexMap.JOBS}' 不存在，将自动创建...`);
        const dimension = this.embeddingModelService.dimensions;
        if (!dimension) {
          throw new Error(
            '无法从 embeddingModelService 获取向量维度，初始化失败。',
          );
        }
        await this.createEmptyIndex(IndexMap.JOBS, dimension);
      }
      this.logger.log('Pinecone 连接验证成功');
    } catch (error) {
      const errorMsg = `
Pinecone 连接失败。可能的原因:
1. 网络连接问题 - 请检查网络连接
2. API密钥错误 - 请检查 PINECONE_API_KEY 环境变量
3. 需要VPN - Pinecone 在某些地区可能需要VPN访问
4. 服务器区域问题 - 当前配置为 ${serverlessConfig.region}

错误详情: ${(error as Error).message}
			`.trim();
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * 文档向量化并储存：新建索引
   * @param splitDocs 要添加的文档数组
   * @param embeddings 用于向量化的嵌入模型
   * @param indexKey 索引别名或索引名
   */
  async embedAndStoreToIndex(
    splitDocs: Document[],
    embeddings: Embeddings,
    indexKey: string,
  ) {
    const indexName = this.getIndexName(indexKey);
    await PineconeStore.fromDocuments(splitDocs, embeddings, {
      pineconeIndex: this.pinecone.Index(indexName),
    });
  }

  /**
   * 文档向量化并储存到已有索引
   * @param documents 要添加的文档数组
   * @param indexKey 索引别名或索引名
   * @param embeddings 用于向量化的嵌入模型
   */
  async addDocumentsToIndex(
    documents: Document[],
    indexKey: string,
    embeddings: Embeddings,
  ): Promise<void> {
    try {
      const indexName = this.getIndexName(indexKey);
      if (!(await this.indexExists(indexName))) {
        throw new Error(`索引 ${indexName} 不存在，请先创建索引`);
      }
      const index = this.pinecone.Index(indexName);
      const pineconeStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex: index,
      });
      //会去调用embeddings的embedDocuments方法
      await pineconeStore.addDocuments(documents);
      console.log(`成功添加 ${documents.length} 个文档到索引 ${indexName}`);
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error(`向索引 ${indexKey} 添加文档失败:`, error);

      if (
        errorMessage.includes('ENOTFOUND') ||
        errorMessage.includes('ECONNREFUSED')
      ) {
        throw new Error(
          `网络连接失败: 无法连接到 Pinecone 或 HuggingFace 服务器。请检查网络连接或VPN设置。`,
        );
      } else if (errorMessage.includes('timeout')) {
        throw new Error(
          `操作超时: 网络连接不稳定或文档过大，请重试或检查VPN连接。`,
        );
      } else if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        throw new Error(
          `认证失败: 请检查 PINECONE_API_KEY 或 HUGGINGFACE_API_KEY 是否正确配置。`,
        );
      }

      throw new Error(`添加文档失败: ${errorMessage}`);
    }
  }

  /**
   * 获取向量数据库检索器
   * @param indexKey 索引别名或索引名
   * @param embeddings 用于向量化的嵌入模型
   * @param config 检索器配置
   * @returns 检索器
   */
  async getRetrieverOfIndex(
    indexKey: string,
    embeddings: Embeddings,
    topK: number = 3,
  ) {
    const indexName = this.getIndexName(indexKey);
    const index = this.pinecone.Index(indexName);
    const vectorStore = new PineconeStore(embeddings, { pineconeIndex: index });

    //FIXME 能返回元数据?
    const retriever = vectorStore.asRetriever(topK);
    return retriever;
  }

  /**
   * 检查指定名称的向量索引是否存在
   * @param indexKey 索引别名标识符（如QIU或自定义索引名）
   * @returns {Promise<boolean>} 是否存在的布尔值
   */
  async indexExists(indexKey: string): Promise<boolean> {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const indexName = this.getIndexName(indexKey);
        const indexes = (await this.pinecone.listIndexes()).indexes;
        if (!indexes || indexes.length === 0) {
          return false;
        }
        return indexes.some((index) => index.name === indexName);
      } catch (error) {
        retryCount++;
        const errorMessage = (error as Error).message;

        if (retryCount >= maxRetries) {
          console.error(
            `检查索引 ${indexKey} 是否存在时出错 (最终失败):`,
            error,
          );

          // 提供详细的网络错误诊断
          if (
            errorMessage.includes('ENOTFOUND') ||
            errorMessage.includes('ECONNREFUSED')
          ) {
            throw new Error(
              `网络连接失败: 无法连接到 Pinecone 服务器。请检查网络连接或VPN设置。`,
            );
          } else if (
            errorMessage.includes('401') ||
            errorMessage.includes('Unauthorized')
          ) {
            throw new Error(`认证失败: 请检查 PINECONE_API_KEY 是否正确配置。`);
          } else if (errorMessage.includes('timeout')) {
            throw new Error(
              `连接超时: 网络连接不稳定，请检查网络状况或尝试使用VPN。`,
            );
          }

          throw error;
        }

        console.warn(
          `检查索引失败，正在重试 (${retryCount}/${maxRetries}):`,
          errorMessage,
        );
        // 指数退避重试
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 1000),
        );
      }
    }

    return false;
  }

  /**
   * 创建空的向量索引
   * @param indexKey 索引别名或直接索引名
   * @param dimension 向量维度
   * @returns {Promise<void>}
   */
  async createEmptyIndex(indexKey: string, dimension: number): Promise<void> {
    try {
      const indexName = this.getIndexName(indexKey);
      await this.pinecone.createIndex({
        name: indexName,
        dimension: dimension,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: serverlessConfig.cloud,
            region: serverlessConfig.region,
          },
        },
      });
      console.log(`成功创建索引: ${indexName}, 维度: ${dimension}`);
    } catch (error) {
      console.error(`创建索引 ${indexKey} 失败:`, error);
      throw new Error(`创建索引失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取本地嵌入模型实例
   * @returns {HuggingFaceTransformersEmbeddings} 本地 SBERT 模型实例
   */
  getLocalEmbeddings(): Embeddings {
    return this.embeddingModelService;
  }

  /**
   * 通过别名获取真实的Pinecone索引名称
   * @param alias - 索引的别名
   * @returns {string} 真实的索引名称
   */
  public getIndexName(keyOrIndexName: string): string {
    return (
      IndexMap[keyOrIndexName.toUpperCase() as keyof typeof IndexMap] ||
      keyOrIndexName
    );
  }
}

/**
 * @param directory 相对于项目根目录的路径
 * @param filename
 * @param dataObj
 * @description 将数据对象以json格式写入文件
 */
export function saveToFile(
  directory: string = './db',
  filename: string,
  dataObj: any,
) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  filename = filename.replace('.json', '');
  const filePath = `${directory}/${filename}.json`;
  fs.writeFile(filePath, JSON.stringify(dataObj), (err) => {
    if (err) {
      console.error(`Error writing ${filename}.json:`, err);
    } else {
      console.log('${filename}.json written successfully:', filePath);
    }
  });
}
