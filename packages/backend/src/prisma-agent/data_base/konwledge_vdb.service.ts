import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { Document } from '@langchain/core/documents';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { FileTypeEnum, KnowledgeTypeEnum, KnowledgeVo, UserInfoFromToken } from '@prism-ai/shared';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ModelService } from '../../model/model.service';
import { OssService } from '../../oss/oss.service';
import { VectorStoreService } from '../../vector-store/vector-store.service';
import { CRetrieveAgentService } from '../c_retrieve_agent/c_retrieve_agent.service';
import { ProjectCodeVDBService } from './project_code_vdb.service';

/**
 * 知识库向量索引的前缀枚举
 */
export enum KnowledgeIndex {
	PROJECT_CODE = 'knowbase_projectCode', //开源、其它项目代码
	PROJECT_DOC = 'knowbase_projectDoc', //用户、开源、其它项目文档
	TECH_DOC = 'knowbase_techDoc', //技术文档
	INTERVIEW_QUESTION = 'knowbase_interviewQuestion', //面试题
	OTHER = 'knowbase_other' //其它
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

	constructor(
		private readonly vectorStoreService: VectorStoreService,
		private readonly modelService: ModelService,
		private readonly ossService: OssService,
		// 注入ProjectCodeVDBService以复用其代码分割逻辑
		@Inject(forwardRef(() => ProjectCodeVDBService))
		private readonly projectCodeVDBService: ProjectCodeVDBService,
		// 注入CRetrieveAgentService以将检索升级为CRAG检索
		@Inject(forwardRef(() => CRetrieveAgentService))
		private readonly cRetrieveAgentService: CRetrieveAgentService
	) {}

	/**
	 * 主入口点：处理知识，将其加载、分割、嵌入并存储到向量数据库。
	 * @param knowledge - 从数据库获取的知识对象
	 * @param userInfo - 当前用户信息
	 */
	async storeKnowledgeToVDB(knowledge: KnowledgeVo, userInfo: UserInfoFromToken): Promise<void> {
		const { id, type } = knowledge;
		this.logger.log(`开始处理知识 [${knowledge.name}] (ID: ${id})...`);

		try {
			// 1. 数据加载
			const documents = await this._loadDocuments(knowledge);
			if (!documents || documents.length === 0) {
				this.logger.warn(`知识 [${knowledge.name}] 未加载到任何文档，已跳过。`);
				return;
			}
			this.logger.log(`  - 已加载 ${documents.length} 个原始文档。`);

			// 2. 切分
			const chunks = await this._splitDocuments(documents, type);
			this.logger.log(`  - 已将文档分割成 ${chunks.length} 个块。`);

			// 3. 嵌入与存储
			const indexName = this._getIndexName(type, userInfo.userId);
			// 索引不存在则创建
			await this._ensureIndexExists(indexName);

			const embeddings = this.embedModel;
			// 为每个块添加原始知识库ID的元数据
			chunks.forEach(chunk => {
				chunk.metadata.knowledgeId = id;
				chunk.metadata.source = chunk.metadata.source || knowledge.name; // 确保有source
			});

			await this.vectorStoreService.addDocumentsToIndex(chunks, indexName, embeddings);
			this.logger.log(`知识 [${knowledge.name}] (ID: ${id}) 处理完成，已存入索引 '${indexName}'。`);
		} catch (error) {
			this.logger.error(`处理知识 [${knowledge.name}] (ID: ${id}) 时出错:`, error);
			throw error; // 将错误向上抛出，以便调用者可以处理
		}
	}

	/**
	 * 从对应索引召回topK个文档
	 * @param prefix - 知识库索引前缀 (e.g., KnowledgeIndex.PROJECT_CODE)
	 * @param query - 用户的查询字符串
	 * @param topK - 需要返回的文档数量
	 * @param userId - 当前用户的ID
	 * @returns {Promise<KnowledgeChunkDoc[]>} - 匹配的文档片段数组
	 */
	async retrieve(
		prefix: KnowledgeIndex,
		query: string,
		topK: number,
		userId: string
	): Promise<KnowledgeChunkDoc[]> {
		const indexName = `${prefix}_${userId}`;
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
	async retrieveCodeAndDoc(query: string, topK: number, userId: string): Promise<string> {
		const prefixs = [
			KnowledgeIndex.PROJECT_CODE,
			KnowledgeIndex.PROJECT_DOC,
			KnowledgeIndex.TECH_DOC
		];
		const retrievers = await Promise.all(
			prefixs.map(prefix => this.getRetriever(prefix, userId, topK))
		);
		const docs = await Promise.all(retrievers.map(retriever => retriever.invoke(query)));
		const texts = docs.map(doc => doc.map(doc => doc.pageContent).join('\n'));
		const text = `
		### 代码参考
		${texts[0]}
		### 项目文档参考
		${texts[1]}
		### 技术文档参考
		${texts[2]}
		`;
		return text;
	}
	/**
	 * retrieveCodeAndDoc的CRAG检索版本
	 */
	async retrieveCodeAndDoc_CRAG(query: string, topK: number, userId: string): Promise<string> {
		const prefixs = [
			KnowledgeIndex.PROJECT_CODE,
			KnowledgeIndex.PROJECT_DOC,
			KnowledgeIndex.TECH_DOC
		];
		const docs = await Promise.all(
			prefixs.map(prefix => this.cRetrieveAgentService.invoke(query, prefix, userId, topK))
		);
		const texts = docs;
		const text = `
		### 代码参考
		${texts[0]}
		### 项目文档参考
		${texts[1]}
		### 技术文档参考
		${texts[2]}
		`;
		return text;
	}

	/**
	 * 获取特定向量索引的检索器
	 * @param prefix 知识库索引前缀 (e.g., KnowledgeIndex.PROJECT_CODE)
	 * @param userId 当前用户的ID
	 * @param topK 每次检索的召回数量
	 */
	async getRetriever(prefix: KnowledgeIndex, userId: string, topK: number) {
		const indexName = `${prefix}_${userId}`;
		const embeddings = this.embedModel;
		const retriever = await this.vectorStoreService.getRetrieverOfIndex(
			indexName,
			embeddings,
			topK
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
				this.logger.log(`  - 从OSS加载PDF文档: ${content}`);
				const buffer = await this.ossService.getObject(content);
				const blob = new Blob([buffer], { type: 'application/pdf' });
				const loader = new PDFLoader(blob);
				const docs = await loader.load();
				docs.forEach(doc => {
					doc.metadata.source = name;
				});
				return docs;

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
		type: `${KnowledgeTypeEnum}`
	): Promise<Document[]> {
		if (type === KnowledgeTypeEnum.openSourceProjectRepo) {
			// 复用ProjectCodeVDBService中的代码分割逻辑
			this.logger.log('  - 使用代码分割策略...');
			const allChunks: Document[] = [];
			for (const doc of documents) {
				// 尝试从路径推断语言，默认为ts
				const lang = this._getLangFromPath(doc.metadata.source) || 'typescript';
				const codeChunks = this.projectCodeVDBService.splitCodeIntoChunks(doc.pageContent, lang);
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
	 * 根据知识类型和用户ID生成完整的索引名称。
	 * @private
	 */
	private _getIndexName(type: `${KnowledgeTypeEnum}`, userId: string): string {
		let prefix: KnowledgeIndex;
		switch (type) {
			case KnowledgeTypeEnum.openSourceProjectRepo:
				prefix = KnowledgeIndex.PROJECT_CODE;
				break;
			case KnowledgeTypeEnum.userProjectDoc:
			case KnowledgeTypeEnum.openSourceProjectDoc:
				prefix = KnowledgeIndex.PROJECT_DOC;
				break;
			case KnowledgeTypeEnum.techDoc:
				prefix = KnowledgeIndex.TECH_DOC;
				break;
			case KnowledgeTypeEnum.interviewQuestion:
				prefix = KnowledgeIndex.INTERVIEW_QUESTION;
				break;
			case KnowledgeTypeEnum.other:
				prefix = KnowledgeIndex.OTHER;
				break;
			default:
				// 兜底策略，确保总有一个地方存储
				this.logger.warn(`未知的知识类型 '${type}'，将使用 'other' 索引。`);
				prefix = KnowledgeIndex.OTHER;
				break;
		}
		return `${prefix}_${userId}`;
	}
}
