import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { Document } from '@langchain/core/documents';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { FileTypeEnum, KnowledgeTypeEnum, KnowledgeVo, UserInfoFromToken } from '@prisma-ai/shared';
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
	OTHER = 'other' //其它
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
	 */
	async storeKnowledgeToVDB(knowledge: KnowledgeVo, userInfo: UserInfoFromToken): Promise<void> {
		const { id, type } = knowledge;
		this.logger.log(`开始处理知识 [${knowledge.name}] (ID: ${id})...`);

		try {
			//  数据加载
			const documents = await this._loadDocuments(knowledge);
			if (!documents || documents.length === 0) {
				this.logger.warn(`知识 [${knowledge.name}] 未加载到任何文档，已跳过。`);
				return;
			}
			this.logger.log(`  - 已加载 ${documents.length} 个原始文档。`);

			//  切分
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
			if (
				type === KnowledgeTypeEnum.openSourceProjectRepo ||
				type === KnowledgeTypeEnum.userProjectCode
			) {
				this.logger.log(`知识 [${knowledge.name}] (ID: ${id}) 应该存入代码库，知识库已忽略。`);
			} else {
				//存入知识库
				indexName = KnowledgeIndex.KNOWLEDGEBASE;
				namespace = this._getUserNamespaceByType(type, userInfo.userId);
				await this.vectorStoreService.addDocumentsToIndex(chunks, indexName, embeddings, namespace);
				this.logger.log(
					`知识 [${knowledge.name}] (ID: ${id}) 处理完成，已存入索引 '${indexName}/${namespace}'。`
				);
			}
		} catch (error) {
			this.logger.error(`处理知识 [${knowledge.name}] (ID: ${id}) 时出错:`, error);
			throw error; // 将错误向上抛出，以便调用者可以处理
		}
	}

	/**
	 * 从对应索引召回topK个文档
	 * @param namespace - 知识库索引前缀 (e.g., KnowledgeNamespace.PROJECT_CODE)
	 * @param query - 用户的查询字符串
	 * @param topK - 需要返回的文档数量
	 * @param userId - 当前用户的ID
	 * @returns {Promise<KnowledgeChunkDoc[]>} - 匹配的文档片段数组
	 */
	async retrieve(
		namespace: KnowledgeNamespace,
		query: string,
		topK: number,
		userId: string
	): Promise<KnowledgeChunkDoc[]> {
		const indexName = this._getUserNamespace(namespace, userId);
		const embeddings = this.embedModel;
		const retriever = await this.vectorStoreService.getRetrieverOfIndex(
			indexName,
			embeddings,
			topK
		);
		return retriever.invoke(query) as unknown as KnowledgeChunkDoc[];
	}

	/**
	 * 从代码、文档索引召回topK个文档(每个索引topK个),并分类组装为文本
	 * @param query - 用户的查询字符串
	 * @param topK - 需要返回的文档数量
	 * @param userId - 当前用户的ID
	 * @returns {Promise<KnowledgeChunkDoc[]>} - 匹配的文档片段数组
	 */
	async retrieveKonwbase(query: string, topK: number, userId: string): Promise<string> {
		let namespaces = [
			KnowledgeNamespace.PROJECT_DOC_USER,
			KnowledgeNamespace.PROJECT_DOC_OPEN,
			KnowledgeNamespace.TECH_DOC
		].map(namespace => this._getUserNamespace(namespace, userId));
		//过滤掉不存在的索引

		const retrievers = await Promise.all(
			namespaces.map(namespace =>
				this.getRetriever(
					KnowledgeIndex.KNOWLEDGEBASE,
					namespace as KnowledgeNamespace,
					userId,
					topK
				)
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
	async retrieveKonwbase_CRAG(query: string, topK: number, userId: string): Promise<string> {
		let namespaces = [
			KnowledgeNamespace.PROJECT_DOC_USER,
			KnowledgeNamespace.PROJECT_DOC_OPEN,
			KnowledgeNamespace.TECH_DOC
		].map(namespace => this._getUserNamespace(namespace, userId));

		const retrievers = await Promise.all(
			namespaces.map(namespace =>
				this.getRetriever(
					KnowledgeIndex.KNOWLEDGEBASE,
					namespace as KnowledgeNamespace,
					userId,
					topK
				)
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
	async getRetriever(
		index: KnowledgeIndex,
		namespace: KnowledgeNamespace,
		userId: string,
		topK: number
	) {
		const namespaceUser = this._getUserNamespace(namespace, userId);
		const embeddings = this.embedModel;
		const retriever = await this.vectorStoreService.getRetrieverOfIndex(
			index,
			embeddings,
			topK,
			namespaceUser
		);
		return retriever;
	}

	/**
	 * 根据文件类型和知识类型动态加载文档。
	 * @private
	 */
	private async _loadDocuments(knowledge: KnowledgeVo): Promise<Document[]> {
		const { fileType, type, content, name } = knowledge;

		switch (fileType) {
			case FileTypeEnum.txt:
				return [new Document({ pageContent: content, metadata: { source: name } })];

			case FileTypeEnum.url:
				if (type === KnowledgeTypeEnum.openSourceProjectRepo) {
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
		type: KnowledgeTypeEnum
	): Promise<Document[]> {
		if (type === KnowledgeTypeEnum.openSourceProjectRepo) {
			// 复用ProjectCodeVDBService中的代码分割逻辑
			this.logger.log('  - 使用代码分割策略...');
			const allChunks: Document[] = [];
			for (const doc of documents) {
				// 尝试从路径推断语言，默认为ts
				const lang = this._getLangFromPath(doc.metadata.source) || 'typescript';
				this.logger.log(`  - 语言推断为 ${lang} 进行${doc.metadata.source}的代码分割...`);
				const codeChunks = await this.projectCodeVDBService.splitCodeIntoChunks(
					doc.pageContent,
					lang
				);
				const chunkDocs = codeChunks.map(
					(chunk: string) => new Document({ pageContent: chunk, metadata: doc.metadata })
				);
				allChunks.push(...chunkDocs);
			}
			return allChunks;
		} else {
			// 其他所有类型使用通用的文本分割器
			this.logger.log('  - 使用通用文本分割策略...');
			const textSplitter = new RecursiveCharacterTextSplitter({
				chunkSize: 500,
				chunkOverlap: 50
			});
			return textSplitter.splitDocuments(documents);
		}
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
	 * 将知识类型映射到命名空间,并生成知识库中用户的命名空间名称。
	 * @private
	 */
	private _getUserNamespaceByType(type: KnowledgeTypeEnum, userId: string): string {
		let namespace: KnowledgeNamespace;
		switch (type) {
			case KnowledgeTypeEnum.userProjectDoc:
				namespace = KnowledgeNamespace.PROJECT_DOC_USER;
				break;
			case KnowledgeTypeEnum.openSourceProjectDoc:
				namespace = KnowledgeNamespace.PROJECT_DOC_OPEN;
				break;
			case KnowledgeTypeEnum.techDoc:
				namespace = KnowledgeNamespace.TECH_DOC;
				break;
			case KnowledgeTypeEnum.interviewQuestion:
				namespace = KnowledgeNamespace.INTERVIEW_QUESTION;
				break;
			case KnowledgeTypeEnum.other:
				namespace = KnowledgeNamespace.OTHER;
				break;
			default:
				// 兜底策略，确保总有一个地方存储
				this.logger.warn(`未知的知识类型 '${type}'，将使用 'other' 索引。`);
				namespace = KnowledgeNamespace.OTHER;
				break;
		}
		return this._getUserNamespace(namespace, userId);
	}
	/**
	 * 生成知识库用户的命名空间名称，区分不同用户。
	 */
	private _getUserNamespace(namespace: KnowledgeNamespace, userId: string): string {
		return `${namespace}-${userId}`;
	}
}
