import { Document } from '@langchain/core/documents';
import { Injectable, Logger } from '@nestjs/common';
import { UserConfig, UserInfoFromToken } from '@prisma-ai/shared';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as path from 'path';
import Parser from 'tree-sitter';
import { project_file, project_file_chunk } from '../../../../generated/client';
import { DbService } from '../../../DB/db.service';
import { ModelService } from '../../../model/model.service';
import { TaskQueueService } from '../../../task-queue/task-queue.service';
import { PersistentTask } from '../../../type/taskqueue';
import { VectorStoreService } from '../../../vector-store/vector-store.service';

/**
 * @description 项目代码向量化任务的元数据接口
 */
interface ProjectEmbeddingTaskMetadata {
	userId: string;
	userInfo: UserInfoFromToken;
	projectName: string;
	projectPath: string;
}

/**
 * @description 带有特定元数据的项目代码向量化任务类型
 */
interface ProjectEmbeddingTask extends PersistentTask {
	metadata: ProjectEmbeddingTaskMetadata;
}

export enum ProjectCodeIndex {
	CODEBASE = 'codebase' //代码库（用户项目代码、开源项目代码）
}

@Injectable()
export class ProjectCodeVDBService {
	private readonly logger = new Logger(ProjectCodeVDBService.name);
	readonly taskTypeCodeEmbedding = 'project_code_embedding';

	private parser: Parser;
	private languageGrammars: { [key: string]: any } = {};

	private readonly vdbIndexs = [ProjectCodeIndex.CODEBASE];

	/**
	 * 支持的语言及其文件扩展名
	 */
	private readonly languageExtensions: Record<string, string[]> = {
		javascript: ['.js', '.jsx', '.cjs', '.mjs'],
		typescript: ['.ts'],
		tsx: ['.tsx'],
		jsx: ['.jsx'],
		java: ['.java'],
		go: ['.go'],
		python: ['.py'],
		cpp: ['.cpp', '.hpp', '.c', '.h', '.cc', '.cxx'],
		json: ['.json'],
		xml: ['.xml']
	};

	/**
	 * 文件扩展名到语言的映射
	 */
	private extensionToLangMap: { [ext: string]: string };

	constructor(
		private readonly vectorStoreService: VectorStoreService,
		private readonly taskQueueService: TaskQueueService,
		private readonly modelService: ModelService,
		private readonly db: DbService
	) {
		this.parser = new Parser();
		this.taskQueueService.registerTaskHandler(
			this.taskTypeCodeEmbedding,
			this._projectCodeEmbeddingTaskHandler.bind(this)
		);
		this.logger.log(`项目代码向量化任务处理器已注册: ${this.taskTypeCodeEmbedding}`);
		//TODO 暂时使用Langchain的RecursiveCharacterTextSplitter切分代码
		// 代码检索功能重构后，再使用tree-sitter切分代码
		// this.loadGrammars();

		this.extensionToLangMap = {};
		for (const lang in this.languageExtensions) {
			for (const ext of this.languageExtensions[lang]) {
				this.extensionToLangMap[ext] = lang;
			}
		}
	}

	/**
	 * 确保用到的向量索引存在
	 */
	async indexExists(userConfig: UserConfig) {
		for (const index of this.vdbIndexs) {
			if (
				!(await this.vectorStoreService.indexExists(userConfig.vectorDb.pinecone.apiKey, index))
			) {
				await this.vectorStoreService.createEmptyIndex(
					userConfig.vectorDb.pinecone.apiKey,
					index,
					this.modelService.getEmbedModelOpenAI(userConfig).dimensions ?? 1536
				);
			}
		}
	}
	/**
	 * 加载所有支持的语言的tree-sitter语法解析器
	 * @private
	 */
	private loadGrammars() {
		try {
			this.languageGrammars['javascript'] = require('tree-sitter-javascript');
			this.languageGrammars['typescript'] = require('tree-sitter-typescript').typescript;
			this.languageGrammars['tsx'] = require('tree-sitter-typescript').tsx;
			this.languageGrammars['java'] = require('tree-sitter-java');
			this.languageGrammars['go'] = require('tree-sitter-go');
			this.languageGrammars['python'] = require('tree-sitter-python');
			this.languageGrammars['cpp'] = require('tree-sitter-cpp');
			this.logger.log('所有tree-sitter语法解析器加载成功。');
		} catch (error) {
			this.logger.error('加载tree-sitter语法解析器失败,请确保相关依赖已安装。', error);
			throw error;
		}
	}

	/**
	 * 启动后台任务，对指定项目代码进行切分、嵌入和存储
	 * @param userId - 用户ID
	 * @param projectName - 项目名称
	 * @param projectPath - 项目的绝对路径
	 * @param sessionId - 会话ID, 用于追踪任务
	 * @returns {Promise<PersistentTask>} - 创建的后台任务
	 */
	async syncToVDB(
		userInfo: UserInfoFromToken,
		projectName: string,
		projectPath: string,
		sessionId: string
	): Promise<PersistentTask> {
		const task = await this.taskQueueService.createAndEnqueueTask(
			sessionId,
			userInfo.userId,
			this.taskTypeCodeEmbedding,
			{
				userId: userInfo.userId,
				userInfo,
				projectName,
				projectPath
			} as ProjectEmbeddingTaskMetadata
		);
		this.logger.log(`已创建项目代码向量化任务: ${task.id}`);
		return task;
	}

	/**
	 * 从向量数据库中检索代码片段
	 * @param query - 查询字符串
	 * @param topK - 返回最匹配的文档数量
	 * @param userId - 用户ID
	 * @param projectName - 项目名称
	 * @returns {Promise<Document[]>} - 匹配的文档片段
	 */
	async retrieveCodeChunks(
		query: string,
		topK: number,
		userInfo: UserInfoFromToken,
		projectName: string
	): Promise<string> {
		const apikey = userInfo.userConfig.vectorDb.pinecone.apiKey;
		await this.indexExists(userInfo.userConfig);

		const namespace = this._getRepoNamespace(projectName, userInfo.userId);
		const embeddings = this.modelService.getEmbedModelOpenAI(userInfo.userConfig);
		const retriever = await this.vectorStoreService.getRetrieverOfIndex(
			apikey,
			ProjectCodeIndex.CODEBASE,
			embeddings,
			topK,
			namespace
		);
		const docs = await retriever.invoke(query);
		return docs.map(doc => `${doc.metadata.source}\n${doc.pageContent}`).join('\n');
	}

	/**
	 * 从向量数据库中检索代码片段
	 * @param query - 查询字符串
	 * @param topK - 返回最匹配的文档数量
	 * @param userId - 用户ID
	 * @param projectName - 项目名称
	 * @returns {Promise<Document[]>} - 匹配的文档片段
	 */
	async retrieveCodeChunksWithScoreFilter(
		query: string,
		topK: number,
		userInfo: UserInfoFromToken,
		projectName: string,
		minScore = 0.6
	): Promise<string> {
		const apikey = userInfo.userConfig.vectorDb.pinecone.apiKey;
		await this.indexExists(userInfo.userConfig);

		const namespace = this._getRepoNamespace(projectName, userInfo.userId);
		const embeddings = this.modelService.getEmbedModelOpenAI(userInfo.userConfig);
		const chunks = await this.vectorStoreService.similaritySearchWithScore(
			apikey,
			ProjectCodeIndex.CODEBASE,
			embeddings,
			query,
			topK,
			namespace
		);
		const chunksFiltered = chunks.filter(chunk => chunk[1] > minScore).map(chunk => chunk[0]);
		return chunksFiltered.map(doc => `${doc.metadata.source}\n${doc.pageContent}`).join('\n');
	}

	/**
	 * 核心：项目代码向量化及增量更新任务的处理器
	 * @param task - 任务对象
	 * @private
	 */
	private async _projectCodeEmbeddingTaskHandler(task: ProjectEmbeddingTask): Promise<void> {
		this.logger.log(`开始执行项目代码向量化任务: ${task.id}`);
		const { projectPath, projectName, userInfo } = task.metadata;

		try {
			await this.syncProject(projectPath, projectName, userInfo);
			this.logger.log(`项目 ${projectName} (用户 ${userInfo.userId}) 同步成功。`);
		} catch (error) {
			this.logger.error(`项目 ${projectName} (用户 ${userInfo.userId}) 同步失败:`, error);
			throw error; // 抛出错误以便任务队列可以记录失败并重试
		}
	}

	/**
	 * 同步项目文件，实现增量更新
	 * @param projectPath 项目的本地路径
	 * @param projectName 项目名称
	 * @param userId 用户ID
	 */
	private async syncProject(projectPath: string, projectName: string, userInfo: UserInfoFromToken) {
		const apikey = userInfo.userConfig.vectorDb.pinecone.apiKey;
		await this.indexExists(userInfo.userConfig);

		this.logger.log(`[Sync] 开始同步项目: ${projectName}`);
		const namespace = this._getRepoNamespace(projectName, String(userInfo.userId));

		// 1. 获取数据库中的项目实体，如果不存在则创建
		let project = await this.db.user_project.findFirst({
			where: { AND: [{ user_id: +userInfo.userId }, { project_name: projectName }] }
		});
		if (!project) {
			project = await this.db.user_project.create({
				data: { user_id: +userInfo.userId, project_name: projectName }
			});
		}

		// 2. 从数据库获取当前项目的文件状态
		const storedFiles = await this.db.project_file.findMany({
			where: { user_project_id: project.id },
			include: { chunks: true }
		});
		const storedFilesMap = new Map(storedFiles.map(f => [f.file_path, f]));
		this.logger.log(`[Sync] 数据库中存在 ${storedFilesMap.size} 个文件记录。`);

		// 3. 从本地文件系统获取当前文件状态
		const localFiles = await this._getProjectFiles(projectPath);
		const localFilesMap = new Map<string, string>();
		for (const file of localFiles) {
			const relativePath = path.relative(projectPath, file);
			const hash = this._calculateFileHash(file);
			localFilesMap.set(relativePath, hash);
		}
		this.logger.log(`[Sync] 本地扫描到 ${localFilesMap.size} 个有效文件。`);

		// 4. 计算差异：新增、修改、删除
		const filesToAdd: { filePath: string; hash: string }[] = [];
		const filesToUpdate: {
			filePath: string;
			hash: string;
			oldFile: project_file & { chunks: project_file_chunk[] };
		}[] = [];
		const filesToDelete: (project_file & { chunks: project_file_chunk[] })[] = [];

		// 找出新增和修改的文件
		for (const [filePath, localHash] of localFilesMap.entries()) {
			/* 
				数据库中记录已经上传的项目文件。
				若文件内容变化就重新上传。
			*/
			const storedFile = storedFilesMap.get(filePath);
			if (!storedFile) {
				filesToAdd.push({ filePath, hash: localHash });
			} else if (storedFile.hash !== localHash) {
				filesToUpdate.push({ filePath, hash: localHash, oldFile: storedFile });
			}
			storedFilesMap.delete(filePath); // 从map中移除，剩下的就是被删除的
		}

		// 找出被删除的文件
		for (const storedFile of storedFilesMap.values()) {
			filesToDelete.push(storedFile);
		}

		this.logger.log(
			`[Sync] 计算差异完成: ${filesToAdd.length} 新增, ${filesToUpdate.length} 修改, ${filesToDelete.length} 删除.`
		);

		// 5. 执行删除操作
		if (filesToDelete.length > 0) {
			const vectorIdsToDelete = filesToDelete.flatMap(f => f.chunks.map(c => c.vector_id));
			if (vectorIdsToDelete.length > 0) {
				this.logger.log(`[Delete] 准备从向量库删除 ${vectorIdsToDelete.length} 个向量...`);
				await this.vectorStoreService.deleteVectors(
					apikey,
					vectorIdsToDelete,
					ProjectCodeIndex.CODEBASE,
					namespace
				);
			}
			// 从数据库中删除文件的chunks将通过 onDelete: Cascade 自动完成
			await this.db.project_file.deleteMany({
				where: { id: { in: filesToDelete.map(f => f.id) } }
			});
			this.logger.log(`[Delete] 已从数据库删除 ${filesToDelete.length} 个文件记录。`);
		}

		// 6. 执行修改操作 (本质是先删后增)
		if (filesToUpdate.length > 0) {
			const vectorIdsToUpdate = filesToUpdate.flatMap(f => f.oldFile.chunks.map(c => c.vector_id));
			if (vectorIdsToUpdate.length > 0) {
				this.logger.log(`[Update] 准备从向量库删除 ${vectorIdsToUpdate.length} 个旧向量...`);
				await this.vectorStoreService.deleteVectors(
					apikey,
					vectorIdsToUpdate,
					ProjectCodeIndex.CODEBASE,
					namespace
				);
			}
			// 将更新的文件加入到新增列表，统一处理
			filesToAdd.push(...filesToUpdate.map(f => ({ filePath: f.filePath, hash: f.hash })));
			this.logger.log(`[Update] 已处理 ${filesToUpdate.length} 个文件的旧记录，转为新增处理。`);
		}

		// 7. 执行新增操作（批量处理）
		if (filesToAdd.length > 0) {
			this.logger.log(`[Add] 准备新增 ${filesToAdd.length} 个文件...`);
			const addPerBatch = 30;

			for (let i = 0; i < filesToAdd.length; i += addPerBatch) {
				const batchFiles = filesToAdd.slice(i, i + addPerBatch);
				const batchDocuments: Document[] = [];
				// 记录每个文件对应的chunks数量，用于后续分配vectorIds
				const fileChunksCount: { fileInfo: (typeof filesToAdd)[0]; count: number }[] = [];

				// 1. 批量准备文档
				for (const fileInfo of batchFiles) {
					const fullPath = path.join(projectPath, fileInfo.filePath);
					try {
						const sourceCode = fs.readFileSync(fullPath, 'utf8');
						const fileExtension = path.extname(fullPath).toLowerCase();
						const lang = this._getLangFromExtension(fileExtension);
						if (!lang) continue;

						const chunks = await this.splitCodeIntoChunksLc(sourceCode, lang);
						if (chunks.length === 0) continue;

						const fileDocs = chunks.map(
							chunk =>
								new Document({
									pageContent: chunk,
									metadata: { source: fileInfo.filePath, lang }
								})
						);

						batchDocuments.push(...fileDocs);
						fileChunksCount.push({ fileInfo, count: fileDocs.length });
					} catch (error) {
						this.logger.error(`[Add] 处理文件 ${fullPath} 失败:`, error);
					}
				}

				if (batchDocuments.length === 0) continue;

				// 2. 批量上传向量
				try {
					const embeddings = this.modelService.getEmbedModelOpenAI(userInfo.userConfig);
					const allVectorIds = await this.vectorStoreService.addDocumentsToIndex(
						apikey,
						batchDocuments,
						ProjectCodeIndex.CODEBASE,
						embeddings,
						namespace
					);

					// 3. 批量更新数据库（分配 vectorIds）
					let currentVectorIndex = 0;
					for (const { fileInfo, count } of fileChunksCount) {
						const fileVectorIds = allVectorIds.slice(
							currentVectorIndex,
							currentVectorIndex + count
						);
						currentVectorIndex += count;

						// 在数据库中创建或更新文件记录
						const existingFile = await this.db.project_file.findFirst({
							where: {
								AND: [{ user_project_id: project.id }, { file_path: fileInfo.filePath }]
							}
						});

						if (existingFile) {
							// 更新
							await this.db.project_file.update({
								where: { id: existingFile.id },
								data: {
									hash: fileInfo.hash,
									chunks: {
										deleteMany: {}, // 删除所有关联的旧chunk记录
										create: fileVectorIds.map(vector_id => ({ vector_id }))
									}
								}
							});
						} else {
							// 创建
							await this.db.project_file.create({
								data: {
									user_project_id: project.id,
									file_path: fileInfo.filePath,
									hash: fileInfo.hash,
									chunks: {
										create: fileVectorIds.map(vector_id => ({ vector_id }))
									}
								}
							});
						}

						this.logger.log(
							`[Add] 文件 ${fileInfo.filePath} 处理完毕，新增 ${fileVectorIds.length} 个向量。`
						);
					}

					this.logger.log(
						`[Batch] 批次 ${i / addPerBatch + 1} 处理完成，共上传 ${batchDocuments.length} 个向量片段。`
					);
				} catch (error) {
					this.logger.error(`[Batch] 批量上传向量失败:`, error);
				}
			}
		}

		this.logger.log(`[Sync] 项目 ${projectName} 同步完成。`);
	}

	/**
	 * 从文件扩展名获取语言类型
	 * @param extension - 文件扩展名 (e.g., '.ts', '.json')
	 * @returns {string | null} - 语言标识符或null
	 * @private
	 */
	private _getLangFromExtension(extension: string): string | null {
		return this.extensionToLangMap[extension.toLowerCase()] || null;
	}

	/**
	 * 递归遍历项目目录，获取所有受支持的文件列表
	 * @param dir - 目标项目文件夹路径
	 * @returns {Promise<string[]>} - 文件路径数组
	 * @private
	 */
	private async _getProjectFiles(dir: string): Promise<string[]> {
		const extensions = Object.keys(this.extensionToLangMap);
		const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'vendor', '__pycache__'];

		let files: string[] = [];
		try {
			const entries = fs.readdirSync(dir, { withFileTypes: true });
			for (const entry of entries) {
				const fullPath = path.join(dir, entry.name);
				if (entry.isDirectory()) {
					if (!ignoreDirs.includes(entry.name)) {
						files = files.concat(await this._getProjectFiles(fullPath));
					}
				} else if (extensions.some(ext => entry.name.toLowerCase().endsWith(ext))) {
					files.push(fullPath);
				}
			}
		} catch (error) {
			this.logger.error(`读取目录 ${dir} 失败:`, error);
			throw error;
		}
		return files;
	}

	/**
	 * 将内部语言标识符映射到Langchain支持的语言标识符
	 * @param lang - 内部语言标识符, e.g., 'typescript'
	 * @returns { 'cpp' | 'go' | 'java' | 'js' | 'python' | null }
	 * @private
	 */
	private _mapToLangchainLang(lang: string): 'cpp' | 'go' | 'java' | 'js' | 'python' | null {
		const mapping = {
			javascript: 'js',
			typescript: 'js',
			tsx: 'js',
			jsx: 'js',
			java: 'java',
			go: 'go',
			python: 'python',
			cpp: 'cpp'
		};
		return mapping[lang] || null;
	}

	/**
	 * 使用Langchain的RecursiveCharacterTextSplitter对代码文件进行切分
	 * @param sourceCode
	 * @param lang
	 */
	public async splitCodeIntoChunksLc(sourceCode: string, lang: string): Promise<string[]> {
		const lcLang = this._mapToLangchainLang(lang);
		let splitter: RecursiveCharacterTextSplitter;

		if (lcLang) {
			this.logger.log(`Using language-specific splitter for: ${lcLang}`);
			splitter = RecursiveCharacterTextSplitter.fromLanguage(lcLang, {
				chunkSize: 1500,
				chunkOverlap: 200
			});
		} else {
			this.logger.log(`Using generic character splitter for: ${lang}`);
			splitter = new RecursiveCharacterTextSplitter({
				chunkSize: 1500,
				chunkOverlap: 200
			});
		}
		return await splitter.splitText(sourceCode);
	}

	/**
	 * 使用tree-sitter将代码文件切分为函数/类块。
	 * 当tree-sitter解析失败时,使用Langchain的RecursiveCharacterTextSplitter进行切分
	 * @param sourceCode - 源代码字符串
	 * @param lang - 语言
	 * @returns {string[]} - 代码块数组
	 * @private
	 */
	public async splitCodeIntoChunks(sourceCode: string, lang: string): Promise<string[]> {
		const grammar = this.languageGrammars[lang];
		if (!grammar) {
			this.logger.warn(`不支持的语言或语法解析器未加载,将整个文件作为代码块: ${lang}`);
			return [sourceCode];
		}
		this.parser.setLanguage(grammar);

		const tree = this.parser.parse(sourceCode);
		const chunks: string[] = [];

		const tsQuery = `
      [
        (import_statement) @chunk
        (export_declaration) @chunk
        (function_declaration) @chunk
        (method_definition) @chunk
        (class_declaration) @chunk
        (lexical_declaration (variable_declarator value: [(arrow_function) (function)])) @chunk
        (interface_declaration) @chunk
        (type_alias_declaration) @chunk
        (expression_statement (assignment_expression)) @chunk
        (export_declaration (variable_declaration)) @chunk
      ]
    `;

		const jsQuery = `
      [
        (import_statement) @chunk
        (export_declaration) @chunk
        (function_declaration) @chunk
        (method_definition) @chunk
        (class_declaration) @chunk
        (lexical_declaration (variable_declarator value: [(arrow_function) (function)])) @chunk
        (expression_statement (assignment_expression)) @chunk
        (export_declaration (variable_declaration)) @chunk
      ]
    `;

		const queryPatterns: Record<string, string> = {
			javascript: jsQuery,
			typescript: tsQuery,
			tsx: tsQuery,
			python: `
          [
            (import_statement) @chunk
            (import_from_statement) @chunk
            (function_definition) @chunk
            (class_definition) @chunk
          ]
        `,
			java: `
          [
            (import_declaration) @chunk
            (class_declaration) @chunk
            (interface_declaration) @chunk
            (enum_declaration) @chunk
          ]
        `,
			go: `
          [
            (import_declaration) @chunk
            (function_declaration) @chunk
            (type_declaration) @chunk
            (const_declaration) @chunk
            (var_declaration) @chunk
          ]
        `,
			cpp: `
          [
            (preproc_include) @chunk
            (using_declaration) @chunk
            (function_definition) @chunk
            (class_specifier) @chunk
            (struct_specifier) @chunk
            (enum_specifier) @chunk
            (template_declaration) @chunk
          ]
        `
		};

		try {
			const query = new Parser.Query(grammar, queryPatterns[lang] || jsQuery);
			const matches = query.matches(tree.rootNode);

			if (matches.length > 0) {
				const allNodes = matches.map(m => m.captures[0].node);
				const nodeSet = new Set(allNodes);

				// 过滤掉作为其他捕获节点子节点的节点
				const topLevelNodes = allNodes.filter(node => {
					let parent = node.parent;
					while (parent) {
						if (nodeSet.has(parent)) {
							return false; // 该节点是另一个捕获节点的子节点，所以过滤掉
						}
						parent = parent.parent;
					}
					return true;
				});

				topLevelNodes.forEach(node => {
					chunks.push(node.text);
				});

				if (chunks.length === 0) {
					// 如果过滤后没有块，则将整个文件作为一个块
					chunks.push(tree.rootNode.text);
				}
			} else {
				// 如果没有匹配到任何块，将整个文件作为一个块
				chunks.push(tree.rootNode.text);
			}

			this.logger.log(`tree-sitter 切分成功,共 ${chunks.length} 个代码块`);
			return chunks;
		} catch (error) {
			//TODO 修正Query的错误, Error: Query error of type TSQueryErrorNodeType

			const lcLang = this._mapToLangchainLang(lang);
			let splitter: RecursiveCharacterTextSplitter;

			if (lcLang) {
				this.logger.log(`Using language-specific splitter for: ${lcLang}`);
				splitter = RecursiveCharacterTextSplitter.fromLanguage(lcLang, {
					chunkSize: 1500,
					chunkOverlap: 200
				});
			} else {
				this.logger.log(`Using generic character splitter for: ${lang}`);
				splitter = new RecursiveCharacterTextSplitter({
					chunkSize: 1500,
					chunkOverlap: 200
				});
			}
			return await splitter.splitText(sourceCode);
		}
	}

	/**
	 * 生成代码库的命名空间名称，区分不同用户。
	 */
	private _getRepoNamespace(repoName: string, userId: string): string {
		return `${repoName}-${userId}`;
	}

	/**
	 * 计算文件的 SHA256 哈希值
	 * @param filePath 文件路径
	 * @returns 文件的哈希值
	 */
	private _calculateFileHash(filePath: string): string {
		const fileBuffer = fs.readFileSync(filePath);
		return crypto.createHash('sha256').update(fileBuffer).digest('hex');
	}
}
