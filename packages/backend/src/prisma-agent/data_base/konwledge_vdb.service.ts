import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { Document } from '@langchain/core/documents';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
	CreateProjectDeepWikiKnowledgeDto,
	FileTypeEnum,
	ProjectKnowledgeTypeEnum,
	ProjectKnowledgeVo,
	UserInfoFromToken
} from '@prisma-ai/shared';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ModelService } from '../../model/model.service';
import { OssService } from '../../oss/oss.service';
import { getOssObjectNameFromURL } from '../../utils/getOssObjectNameFromURL';
import { VectorStoreService } from '../../vector-store/vector-store.service';
import { CRetrieveAgentService } from '../c_retrieve_agent/c_retrieve_agent.service';
import { ProjectCodeVDBService } from './project_code_vdb.service';
/**
 * 知识库向量索引的前缀枚举
 */
export enum KnowledgeNamespace {
	PROJECT_DOC_USER = 'project-doc-user', //用户项目文档
	PROJECT_DOC_OPEN = 'project-doc-open', //开源项目文档
	TECH_DOC = 'tech-doc', //技术文档
	INTERVIEW_QUESTION = 'interview-question', //面试题
	OTHER = 'other', //其它
	USER_PROJECT_DEEPWIKI = 'project-deepwiki' //用户项目deepwiki文档
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
export class KnowledgeVDBService implements OnModuleInit {
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
	async onModuleInit() {
		for (const index of this.vdbIndexs) {
			if (!(await this.vectorStoreService.indexExists(index))) {
				await this.vectorStoreService.createEmptyIndex(index, this.embedModel.dimensions ?? 1536);
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
		try {
			const namespace = this._getUserProjectNamespaceByType(type, userInfo.userId, projectName);
			await this.vectorStoreService.deleteVectors(
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
		userId: string,
		projectName: string
	): Promise<string> {
		let namespaces = [
			KnowledgeNamespace.PROJECT_DOC_USER,
			KnowledgeNamespace.PROJECT_DOC_OPEN,
			KnowledgeNamespace.TECH_DOC
		].map(namespace => this._getUserProjectNamespace(namespace, userId, projectName));
		//过滤掉不存在的索引

		const retrievers = await Promise.all(
			namespaces.map(namespace =>
				this.getRetriever(KnowledgeIndex.KNOWLEDGEBASE, namespace, userId, topK)
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
	 * retrieveCodeAndDoc的CRAG检索版本
	 */
	async retrieveKonwbase_CRAG(
		query: string,
		topK: number,
		userId: string,
		projectName: string
	): Promise<string> {
		let namespaces = [
			KnowledgeNamespace.PROJECT_DOC_USER,
			KnowledgeNamespace.PROJECT_DOC_OPEN,
			KnowledgeNamespace.TECH_DOC
		].map(namespace => this._getUserProjectNamespace(namespace, userId, projectName));

		const retrievers = await Promise.all(
			namespaces.map(namespace =>
				this.getRetriever(KnowledgeIndex.KNOWLEDGEBASE, namespace, userId, topK)
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
		userId: string,
		topK: number
	) {
		const embeddings = this.embedModel;
		const retriever = await this.vectorStoreService.getRetrieverOfIndex(
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
	 * 根据文件路径猜测编程语言。
	 * @private
	 */
	private _getLangFromPath(filePath: string): string | null {
		const extension = filePath.split('.').pop();
		if (!extension) return null;
		const extToLang: Record<string, string> = {
			js: 'javascript',
			jsx: 'javascript',
			ts: 'typescript',
			tsx: 'typescript',
			py: 'python',
			java: 'java',
			go: 'go',
			cpp: 'cpp',
			c: 'cpp',
			hpp: 'cpp',
			h: 'cpp'
		};
		return extToLang[extension] || null;
	}

	/**
	 * 确保向量索引存在，如果不存在则创建。
	 * @private
	 */
	private async _ensureIndexExists(indexName: string): Promise<void> {
		const exists = await this.vectorStoreService.indexExists(indexName);
		if (!exists) {
			this.logger.log(`索引 '${indexName}' 不存在，将自动创建...`);
			const embedding = this.embedModel;
			await this.vectorStoreService.createEmptyIndex(indexName, embedding.dimensions ?? 1536);
		}
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
