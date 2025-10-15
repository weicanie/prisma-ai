import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { Document } from '@langchain/core/documents';
import { Injectable, Logger } from '@nestjs/common';
import {
	CreateProjectDeepWikiKnowledgeDto,
	FileTypeEnum,
	ProjectKnowledgeTypeEnum,
	ProjectKnowledgeVo,
	UserInfoFromToken
} from '@prisma-ai/shared';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

import { ModelService } from '../../../model/model.service';
import { OssService } from '../../../oss/oss.service';
import { getOssObjectNameFromURL } from '../../../utils/getOssObjectNameFromURL';
import { VectorStoreService } from '../../../vector-store/vector-store.service';
import { CRetrieveAgentService } from '../c_retrieve_agent/c_retrieve_agent.service';
import { ProjectCodeVDBService } from './project_code_vdb.service';
/**
 * 知识库向量索引的前缀枚举
 */
export enum KnowledgeNamespace {
	PROJECT_DOC_USER = 'project-doc-user', //项目文档
	TECH_DOC = 'tech-doc', //项目相关的技术文档
	OTHER = 'other', //项目相关的其他信息
	USER_PROJECT_DEEPWIKI = 'project-deepwiki' //项目deepwiki文档
}

export enum KnowledgeIndex {
	KNOWLEDGEBASE = 'knowledgebase' //知识库
}

/**
 * 召回的文档chunk
 */
interface KnowledgeChunkDoc extends Document {
	metadata: {
		knowledgeId: string; // 数据库中的文档id
		/* 
    CheerioWebBaseLoader：会自动将URL作为source字段存储在metadata中
    GithubRepoLoader：会自动将每个文件的相对路径作为source存储
    PDFLoader：手动设置为知识名称
    text：手动设置为知识名称
    */
		source: string;
	};
}

@Injectable()
export class KnowledgeVDBService {
	private readonly logger = new Logger(KnowledgeVDBService.name);

	private readonly embedModel = this.modelService.getEmbedModelOpenAI();

	private readonly vdbIndexs = [KnowledgeIndex.KNOWLEDGEBASE];

	constructor(
		private readonly vectorStoreService: VectorStoreService,
		private readonly modelService: ModelService,
		private readonly ossService: OssService,
		// 注入ProjectCodeVDBService以复用其代码分割逻辑
		private readonly projectCodeVDBService: ProjectCodeVDBService,
		// 注入CRetrieveAgentService以将检索升级为CRAG检索
		private readonly cRetrieveAgentService: CRetrieveAgentService
	) {}

	/**
	 * 确保用到的向量索引存在
	 */
	async indexExists(apiKey: string) {
		for (const index of this.vdbIndexs) {
			if (!(await this.vectorStoreService.indexExists(apiKey, index))) {
				await this.vectorStoreService.createEmptyIndex(
					apiKey,
					index,
					this.embedModel.dimensions ?? 1536
				);
			}
		}
	}

	/**
	 * 主入口点：处理知识，将其加载、分割、嵌入并存储到向量数据库。
	 * @param knowledge - 从数据库获取的知识对象
	 * @param userInfo - 当前用户信息
	 * @returns vector ID 列表
	 */
	async storeKnowledgeToVDB(
		knowledge: ProjectKnowledgeVo,
		userInfo: UserInfoFromToken
	): Promise<string[]> {
		const apiKey = userInfo.userConfig.vectorDb.pinecone.apiKey;
		await this.indexExists(apiKey);

		const { id, type, projectName } = knowledge;
		this.logger.log(`开始处理知识 [${knowledge.name}] (ID: ${id})...`);

		try {
			// 数据加载
			const documents = await this._loadDocuments(knowledge);
			if (!documents || documents.length === 0) {
				this.logger.warn(`知识 [${knowledge.name}] 未加载到任何文档，已跳过。`);
				return [];
			}
			this.logger.log(`  - 已加载 ${documents.length} 个原始文档。`);
			// 切分
			const chunks = await this._splitDocuments(documents, type);
			this.logger.log(`  - 已将文档分割成 ${chunks.length} 个块。`);
			const embeddings = this.embedModel;
			// 为每个块添加原始知识库ID的元数据
			chunks.forEach(chunk => {
				chunk.metadata.knowledgeId = id;
				chunk.metadata.source = chunk.metadata.source || knowledge.name; // 确保有source
			});

			let indexName: KnowledgeIndex;
			let namespace: string;
			if (type === ProjectKnowledgeTypeEnum.userProjectCode) {
				this.logger.log(`知识 [${knowledge.name}] (ID: ${id}) 应该存入代码库，知识库已忽略。`);
				return [];
			} else {
				//存入知识库
				indexName = KnowledgeIndex.KNOWLEDGEBASE;
				namespace = this._getUserProjectNamespaceByType(type, userInfo.userId, projectName);
				const vectorIds = await this.vectorStoreService.addDocumentsToIndex(
					apiKey,
					chunks,
					indexName,
					embeddings,
					namespace
				);
				this.logger.log(
					`知识 [${knowledge.name}] (ID: ${id}) 处理完成，已存入索引 '${indexName}/${namespace}'。`
				);
				return vectorIds;
			}
		} catch (error) {
			this.logger.error(`处理知识 [${knowledge.name}] (ID: ${id}) 时出错:`, error);
			throw error; // 将错误向上抛出，以便调用者可以处理
		}
	}

	/**
	 * 存储项目deepwiki文档到向量数据库
	 * @param knowledge CreateProjectKnowledgeDto
	 * @param userInfo
	 * @returns vector ID 列表
	 */
	async storeDeepWikiToVDB(
		knowledge: CreateProjectDeepWikiKnowledgeDto & { content: string },
		userInfo: UserInfoFromToken
	): Promise<string[]> {
		const apiKey = userInfo.userConfig.vectorDb.pinecone.apiKey;
		await this.indexExists(apiKey);

		try {
			//数据加载
			const doc = new Document({
				pageContent: knowledge.content,
				metadata: { source: knowledge.name }
			});
			//切分
			const chunks = await this._splitDocuments([doc], knowledge.type);
			//存储
			const namespace = this._getUserProjectNamespaceByType(
				knowledge.type,
				userInfo.userId,
				knowledge.projectName
			);
			const vectorIds = await this.vectorStoreService.addDocumentsToIndex(
				apiKey,
				chunks,
				KnowledgeIndex.KNOWLEDGEBASE,
				this.embedModel,
				namespace
			);
			return vectorIds;
		} catch (error) {
			this.logger.error(`存储deepwiki知识时出错:`, error.trace);
			throw error; // 将错误向上抛出，以便调用者可以处理
		}
	}

	async deleteKnowledgeFromVDB(
		vectorIds: string[],
		type: ProjectKnowledgeTypeEnum,
		userInfo: UserInfoFromToken,
		projectName: string
	): Promise<void> {
		const apiKey = userInfo.userConfig.vectorDb.pinecone.apiKey;
		await this.indexExists(apiKey);

		try {
			const namespace = this._getUserProjectNamespaceByType(type, userInfo.userId, projectName);
			await this.vectorStoreService.deleteVectors(
				apiKey,
				vectorIds,
				KnowledgeIndex.KNOWLEDGEBASE,
				namespace
			);
		} catch (error) {
			this.logger.error(`删除知识时出错:`, error.trace);
			throw error; // 将错误向上抛出，以便调用者可以处理
		}
	}

	/**
	 * 从代码、文档索引召回topK个文档(每个索引topK个),并分类组装为文本
	 * @param query - 用户的查询字符串
	 * @param topK - 需要返回的文档数量
	 * @param userId - 当前用户的ID
	 * @returns {Promise<KnowledgeChunkDoc[]>} - 匹配的文档片段数组
	 */
	async retrieveKnowbase(
		query: string,
		topK: number,
		userInfo: UserInfoFromToken,
		projectName: string
	): Promise<string> {
		let namespaces = [KnowledgeNamespace.PROJECT_DOC_USER, KnowledgeNamespace.TECH_DOC].map(
			namespace => this._getUserProjectNamespace(namespace, userInfo.userId, projectName)
		);
		//过滤掉不存在的索引

		const retrievers = await Promise.all(
			namespaces.map(namespace =>
				this.getRetriever(KnowledgeIndex.KNOWLEDGEBASE, namespace, userInfo, topK)
			)
		);

		const docs = await Promise.all(retrievers.map(retriever => retriever.invoke(query)));
		const texts = docs.map(doc => doc.map(doc => doc.pageContent).join('\n'));
		const text = `
		### 项目文档参考
		${texts[0]}
		${texts[1]}
		### 技术文档参考
		${texts[2]}
		`;
		return text;
	}

	/**
	 * 从代码、文档索引召回topK个文档(每个索引召回topK个，然后去掉 score<minScore 的),并分类组装为文本,返回所选命名空间匹配的文档文本
	 * @param query - 用户的查询字符串
	 * @param topK - 需要返回的文档数量
	 * @param userId - 当前用户的ID
	 * @param projectName - 项目名称
	 * @param knowledgeNamespaces - 所选命名空间
	 */
	async retrieveKnowbaseFromNamespaceWithScoreFilter(
		query: string,
		topK: number,
		userInfo: UserInfoFromToken,
		projectName: string,
		knowledgeNamespaces: KnowledgeNamespace[],
		minScore = 0.6
	) {
		const apiKey = userInfo.userConfig.vectorDb.pinecone.apiKey;
		await this.indexExists(apiKey);
		let namespaces = knowledgeNamespaces.map(namespace =>
			this._getUserProjectNamespace(namespace, userInfo.userId, projectName)
		);
		4;

		const nsDocs = await Promise.all(
			namespaces.map(ns => {
				return this.vectorStoreService.similaritySearchWithScore(
					apiKey,
					KnowledgeIndex.KNOWLEDGEBASE,
					this.embedModel,
					query,
					topK,
					ns
				);
			})
		);
		// 去掉了相似度<minScore的召回结果
		const text_filtered = nsDocs.map(nsdoc =>
			nsdoc
				.map(doc => ({
					doc: doc[0].pageContent,
					score: doc[1]
				}))
				.filter(text_score_pair => text_score_pair.score > minScore)
				.join('\n\n')
		);

		const result: Record<KnowledgeNamespace, string> = {} as Record<KnowledgeNamespace, string>;
		for (let i = 0; i < knowledgeNamespaces.length; i++) {
			result[knowledgeNamespaces[i]] = text_filtered[i];
		}
		return result;
	}

	/**
	 * retrieveCodeAndDoc的CRAG检索版本
	 */
	async retrieveKonwbase_CRAG(
		query: string,
		topK: number,
		userInfo: UserInfoFromToken,
		projectName: string
	): Promise<string> {
		let namespaces = [KnowledgeNamespace.PROJECT_DOC_USER, KnowledgeNamespace.TECH_DOC].map(
			namespace => this._getUserProjectNamespace(namespace, userInfo.userId, projectName)
		);

		const retrievers = await Promise.all(
			namespaces.map(namespace =>
				this.getRetriever(KnowledgeIndex.KNOWLEDGEBASE, namespace, userInfo, topK)
			)
		);

		const docs = await Promise.all(
			retrievers.map(retriever => this.cRetrieveAgentService.invoke(query, retriever))
		);

		const texts = docs;
		const text = `
		### 项目文档参考
		${texts[0]}
		${texts[1]}
		### 技术文档参考
		${texts[2]}
		`;
		return text;
	}

	/**
	 * 获取特定向量索引的检索器
	 * @param namespace 知识库索引前缀 (e.g., KnowledgeNamespace.PROJECT_CODE)
	 * @param userId 当前用户的ID
	 * @param topK 每次检索的召回数量
	 */
	private async getRetriever(
		index: KnowledgeIndex,
		namespace: string,
		userInfo: UserInfoFromToken,
		topK: number
	) {
		const apiKey = userInfo.userConfig.vectorDb.pinecone.apiKey;
		await this.indexExists(apiKey);

		const embeddings = this.embedModel;
		const retriever = await this.vectorStoreService.getRetrieverOfIndex(
			apiKey,
			index,
			embeddings,
			topK,
			namespace
		);
		return retriever;
	}

	/**
	 * 根据文件类型和知识类型动态加载文档。
	 * @private
	 */
	private async _loadDocuments(knowledge: ProjectKnowledgeVo): Promise<Document[]> {
		const { fileType, type, content, name } = knowledge;

		switch (fileType) {
			case FileTypeEnum.txt:
				return [new Document({ pageContent: content, metadata: { source: name } })];

			case FileTypeEnum.url:
				if (type === ProjectKnowledgeTypeEnum.userProjectCode) {
					this.logger.log(`  - 使用 GithubRepoLoader 加载: ${content}`);
					const loader = new GithubRepoLoader(content, {
						branch: 'main',
						recursive: true,
						ignoreFiles: ['.gitignore', 'node_modules', 'dist', 'build']
					});
					return loader.load();
				} else {
					this.logger.log(`  - 使用 CheerioWebBaseLoader 加载: ${content}`);
					const loader = new CheerioWebBaseLoader(content);
					return loader.load();
				}

			case FileTypeEnum.doc:
				this.logger.log(`  - 从OSS加载PDF文档: ${content} -> ${getOssObjectNameFromURL(content)}`);
				const buffer = await this.ossService.getObject(getOssObjectNameFromURL(content));
				const blob = new Blob([buffer], { type: 'application/pdf' });
				const loader = new PDFLoader(blob);
				const docs = await loader.load();
				docs.forEach(doc => {
					doc.metadata.source = name;
				});
				return docs;

			case FileTypeEnum.md:
				this.logger.log(`  - 从OSS加载Markdown文档: ${content}`);
				// 1. 从OSS获取文件内容缓冲区
				const mdBuffer = await this.ossService.getObject(getOssObjectNameFromURL(content));
				// 2. 将缓冲区转换为UTF-8字符串
				const mdContent = mdBuffer.toString('utf-8');
				// 3. 直接创建一个新的Document对象。
				return [
					new Document({
						pageContent: mdContent,
						metadata: { source: name }
					})
				];

			default:
				this.logger.warn(`不支持的文件类型: ${fileType}，知识: ${name}`);
				return [];
		}
	}

	/**
	 * 根据知识类型选择合适的分割策略。
	 * @private
	 */
	private async _splitDocuments(
		documents: Document[],
		type: ProjectKnowledgeTypeEnum
	): Promise<Document[]> {
		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1200,
			chunkOverlap: 300
		});
		const mdSplitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
			chunkSize: 1200, // 推荐: 800-1200字符
			chunkOverlap: 300 // 推荐: chunkSize的20-25%
		});
		const splitter =
			type === ProjectKnowledgeTypeEnum.userProjectDeepWiki ? mdSplitter : textSplitter;
		return splitter.splitDocuments(documents);
	}

	/**
	 * 生成知识库用户的项目命名空间名称，区分不同用户、不同项目。
	 */
	private _getUserProjectNamespace(namespace: string, userId: string, projectName: string): string {
		return `${namespace}-${userId}-${projectName}`;
	}

	private _getUserProjectNamespaceByType(
		type: ProjectKnowledgeTypeEnum,
		userId: string,
		projectName: string
	): string {
		let namespace: string;
		switch (type) {
			case ProjectKnowledgeTypeEnum.userProjectDoc:
				namespace = KnowledgeNamespace.PROJECT_DOC_USER;
				break;
			case ProjectKnowledgeTypeEnum.techDoc:
				namespace = KnowledgeNamespace.TECH_DOC;
				break;
			case ProjectKnowledgeTypeEnum.other:
				namespace = KnowledgeNamespace.OTHER;
				break;
			case ProjectKnowledgeTypeEnum.userProjectDeepWiki:
				namespace = KnowledgeNamespace.USER_PROJECT_DEEPWIKI;
				break;
			default:
				// 兜底策略，确保总有一个地方存储
				this.logger.warn(`未知的知识类型 '${type}'，将使用 'other' 索引。`);
				namespace = KnowledgeNamespace.OTHER;
				break;
		}
		return this._getUserProjectNamespace(namespace, userId, projectName);
	}
}
