import { Document } from '@langchain/core/documents';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as path from 'path';
import Parser from 'tree-sitter';
import { ModelService } from '../../model/model.service';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { PersistentTask } from '../../type/taskqueue';
import { projectsDirPath } from '../../utils/constants';
import { VectorStoreService } from '../../vector-store/vector-store.service';

/**
 * @description 项目代码向量化任务的元数据接口
 */
interface ProjectEmbeddingTaskMetadata {
	userId: string;
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
export class ProjectCodeVDBService implements OnModuleInit {
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
		private readonly modelService: ModelService
	) {
		this.parser = new Parser();
		this.taskQueueService.registerTaskHandler(
			this.taskTypeCodeEmbedding,
			this._projectCodeEmbeddingTaskHandler.bind(this)
		);
		this.logger.log(`项目代码向量化任务处理器已注册: ${this.taskTypeCodeEmbedding}`);
		this.loadGrammars();

		this.extensionToLangMap = {};
		for (const lang in this.languageExtensions) {
			for (const ext of this.languageExtensions[lang]) {
				this.extensionToLangMap[ext] = lang;
			}
		}

		//确保项目代码目录存在
		if (!fs.existsSync(projectsDirPath)) {
			fs.mkdirSync(projectsDirPath, { recursive: true });
		}
	}

	/**
	 * 确保用到的向量索引存在
	 */
	async onModuleInit() {
		for (const index of this.vdbIndexs) {
			if (!(await this.vectorStoreService.indexExists(index))) {
				await this.vectorStoreService.createEmptyIndex(
					index,
					this.modelService.getEmbedModelOpenAI().dimensions ?? 1536
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
	async storeToVDB(
		userId: string,
		projectName: string,
		projectPath: string,
		sessionId: string
	): Promise<PersistentTask> {
		const task = await this.taskQueueService.createAndEnqueueTask(
			sessionId,
			userId,
			this.taskTypeCodeEmbedding,
			{
				userId,
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
		userId: string,
		projectName: string
	): Promise<string> {
		const namespace = this._getRepoNamespace(projectName, userId);
		const embeddings = this.modelService.getEmbedModelOpenAI();
		const retriever = await this.vectorStoreService.getRetrieverOfIndex(
			ProjectCodeIndex.CODEBASE,
			embeddings,
			topK,
			namespace
		);
		const docs = await retriever.invoke(query);
		return docs.map(doc => `${doc.metadata.source}\n${doc.pageContent}`).join('\n');
	}

	//TODO 将原执行逻辑从任务处理器中分离,组合
	/**
	 * 项目代码向量化任务的处理器
	 * @param task - 任务对象
	 * @private
	 */
	private async _projectCodeEmbeddingTaskHandler(task: ProjectEmbeddingTask): Promise<void> {
		this.logger.log(`开始执行项目代码向量化任务: ${task.id}`);
		const { projectPath, projectName, userId } = task.metadata;

		// 2. 遍历项目文件
		const files = await this._getProjectFiles(projectPath);
		this.logger.log(`在项目 ${projectPath} 中找到 ${files.length} 个待处理文件`);

		// 3. 对每个文件进行处理
		const chunksToEmbed: Document[] = [];
		for (const file of files) {
			try {
				const fileExtension = path.extname(file).toLowerCase();
				const lang = this._getLangFromExtension(fileExtension);

				if (!lang) {
					this.logger.warn(`文件 ${file} 的扩展名 ${fileExtension} 不受支持，已跳过`);
					continue;
				}

				const sourceCode = fs.readFileSync(file, 'utf8');
				// 4. 切分代码
				const chunks = await this.splitCodeIntoChunks(sourceCode, lang);
				if (chunks.length === 0) {
					this.logger.warn(`文件 ${file} 未提取到代码块，已跳过`);
					continue;
				}

				// 5. 组织为Document并存入向量数据库
				const relativePath = path.relative(projectPath, file);
				const documents = chunks.map(
					chunk =>
						new Document({
							pageContent: chunk,
							metadata: { source: relativePath, lang }
						})
				);
				chunksToEmbed.push(...documents);
			} catch (error) {
				this.logger.error(`处理文件 ${file} 失败:`, error);
				throw error;
			}
		}
		const namespace = this._getRepoNamespace(projectName, userId);
		const embeddings = this.modelService.getEmbedModelOpenAI();
		await this.vectorStoreService.addDocumentsToIndex(
			chunksToEmbed,
			ProjectCodeIndex.CODEBASE,
			embeddings,
			namespace
		);
		this.logger.log(
			`项目代码向量化任务 ${task.id} 完成。共上传 ${chunksToEmbed.length} 个代码块。`
		);
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
			java: 'java',
			go: 'go',
			python: 'python',
			cpp: 'cpp'
		};
		return mapping[lang] || null;
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
			//FIXME 修正Query的错误, Error: Query error of type TSQueryErrorNodeType

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
}
