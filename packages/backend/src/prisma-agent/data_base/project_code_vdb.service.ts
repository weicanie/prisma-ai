import { Document } from '@langchain/core/documents';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import Parser from 'tree-sitter';
import { ModelService } from '../model/model.service';
import { PersistentTask, TaskQueueService } from '../task-queue/task-queue.service';
import { VectorStoreService } from '../vector-store/vector-store.service';


/**
 * @description 项目代码向量化任务的元数据接口
 */
interface ProjectEmbeddingTaskMetadata {
  userId: string;
  projectName: string;
  projectPath: string;
  lang: string;
  indexName: string;
}

/**
 * @description 带有特定元数据的项目代码向量化任务类型
 */
interface ProjectEmbeddingTask extends PersistentTask {
  metadata: ProjectEmbeddingTaskMetadata;
}

/**
 * 项目代码向量索引的前缀枚举
 */
export enum ProjectCodeIndexPrefix {
  PROJECT_CODE = 'agent_projectCode',
}

@Injectable()
export class ProjectCodeVDBService {
  private readonly logger = new Logger(ProjectCodeVDBService.name);
  readonly taskTypeCodeEmbedding = 'project_code_embedding';

  private parser: Parser;
  private languageGrammars: { [key: string]: any } = {};

  constructor(
    private readonly vectorStoreService: VectorStoreService,
    private readonly taskQueueService: TaskQueueService,
    private readonly modelService: ModelService,
  ) {
    this.parser = new Parser();
    this.taskQueueService.registerTaskHandler(
      this.taskTypeCodeEmbedding,
      this._projectCodeEmbeddingTaskHandler.bind(this),
    );
    this.logger.log(`项目代码向量化任务处理器已注册: ${this.taskTypeCodeEmbedding}`);
    this.loadGrammars();
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
      // 在无法加载解析器时，应用可能无法正常处理代码，这里可以决定是否抛出异常中断启动
    }
  }

  /**
   * 启动后台任务，对指定项目代码进行切分、嵌入和存储
   * @param userId - 用户ID
   * @param projectName - 项目名称
   * @param projectPath - 项目的绝对路径
   * @param sessionId - 会话ID, 用于追踪任务
   * @param lang - 项目主要语言 (默认为 'typescript')
   * @returns {Promise<PersistentTask>} - 创建的后台任务
   */
  async storeToVDB(
    userId: string,
    projectName: string,
    projectPath: string,
    sessionId: string,
    lang: string = 'typescript',
  ): Promise<PersistentTask> {
    const indexName = `${ProjectCodeIndexPrefix.PROJECT_CODE}_${projectName}_${userId}`;
    const task = await this.taskQueueService.createAndEnqueueTask(
      sessionId,
      userId,
      this.taskTypeCodeEmbedding,
      {
        userId,
        projectName,                    
        projectPath,
        lang,
        indexName,
      } as ProjectEmbeddingTaskMetadata,
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
  async retrieveChunk(
    query: string,
    topK: number,
    userId: string,
    projectName: string,
  ): Promise<Document[]> {
    const indexName = `${ProjectCodeIndexPrefix.PROJECT_CODE}_${projectName}_${userId}`;
    const embeddings = this.modelService.getEmbedModelOpenAI();

    const retriever = await this.vectorStoreService.getRetrieverOfIndex(indexName, embeddings, topK);
    return retriever.invoke(query);
  }

  /**
   * 项目代码向量化任务的处理器
   * @param task - 任务对象
   * @private
   */
  private async _projectCodeEmbeddingTaskHandler(
    task: ProjectEmbeddingTask,
  ): Promise<void> {
    this.logger.log(`开始执行项目代码向量化任务: ${task.id}`);
    const { projectPath, lang, indexName } = task.metadata;

    // 1. 确保向量索引存在，不存在则创建
    const indexExists = await this.vectorStoreService.indexExists(indexName);
    if (!indexExists) {
      this.logger.log(`索引 '${indexName}' 不存在，将自动创建...`);
      const tempEmbedding = await this.vectorStoreService
        .getLocalEmbeddings()
        .embedQuery('get dimension');
      const dimension = tempEmbedding.length;
      await this.vectorStoreService.createEmptyIndex(indexName, dimension);
    }

    // 2. 遍历项目文件
    const files = await this._getProjectFiles(projectPath, lang);
    this.logger.log(`在项目 ${projectPath} 中找到 ${files.length} 个'${lang}'文件`);

    // 3. 对每个文件进行处理
    for (const file of files) {
      try {
        const sourceCode = await fs.readFile(file, 'utf8');
        // 4. 切分代码
        const chunks = this.splitCodeIntoChunks(sourceCode, lang);
        if (chunks.length === 0) {
          this.logger.warn(`文件 ${file} 未提取到代码块，已跳过`);
          continue;
        }

        // 5. 组织为Document并存入向量数据库
        const relativePath = path.relative(projectPath, file);
        const documents = chunks.map(
          (chunk) =>
            new Document({
              pageContent: chunk,
              metadata: { source: relativePath, lang },
            }),
        );
        
        const embeddings = this.vectorStoreService.getLocalEmbeddings();
        await this.vectorStoreService.addDocumentsToIndex(
          documents,
          indexName,
          embeddings
        );
        this.logger.log(`已处理文件 ${relativePath}，存入 ${documents.length} 个代码块。`);
      } catch (error) {
        this.logger.error(`处理文件 ${file} 失败:`, error);
      }
    }

    this.logger.log(`项目代码向量化任务 ${task.id} 完成。`);
  }

  /**
   * 递归遍历项目目录，获取指定语言的文件列表
   * @param dir - 目录路径
   * @param lang - 语言
   * @returns {Promise<string[]>} - 文件路径数组
   * @private
   */
  private async _getProjectFiles(dir: string, lang: string): Promise<string[]> {
    const languageExtensions: Record<string, string[]> = {
      javascript: ['.js', '.jsx', '.cjs', '.mjs'],
      typescript: ['.ts', '.tsx'],
      java: ['.java'],
      go: ['.go'],
      python: ['.py'],
      cpp: ['.cpp', '.hpp', '.c', '.h', '.cc', '.cxx'],
    };
    const extensions = languageExtensions[lang] || languageExtensions['typescript'];
    const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'vendor', '__pycache__'];

    let files: string[] = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!ignoreDirs.includes(entry.name)) {
            files = files.concat(await this._getProjectFiles(fullPath, lang));
          }
        } else if (extensions.some(ext => entry.name.endsWith(ext) || entry.name.endsWith('.json'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      this.logger.error(`读取目录 ${dir} 失败:`, error);
    }
    return files;
  }

  /**
   * 使用tree-sitter将代码文件切分为函数/类块
   * @param sourceCode - 源代码字符串
   * @param lang - 语言
   * @returns {string[]} - 代码块数组
   * @private
   */
   public splitCodeIntoChunks(sourceCode: string, lang: string): string[] {
    const grammar = this.languageGrammars[lang];
    if (!grammar) {
      this.logger.error(`不支持的语言或语法解析器未加载: ${lang}`);
      return [sourceCode]; // Fallback to whole file
    }
    this.parser.setLanguage(grammar);

    const tree = this.parser.parse(sourceCode);
    const chunks: string[] = [];

    const queryPatterns: Record<string, string> = {
        javascript: `
          [(function_declaration) @chunk]
          [(class_declaration) @chunk]
          [(method_definition) @chunk]
          [(lexical_declaration (variable_declarator value: [(arrow_function) (function)])) @chunk]
        `,
        typescript: `
          [(function_declaration) @chunk]
          [(class_declaration) @chunk]
          [(method_definition) @chunk]
          [(lexical_declaration (variable_declarator type: _ value: (arrow_function))) @chunk]
        `,
        python: `
          [(function_definition) @chunk]
          [(class_definition) @chunk]
        `,
        java: `
          [(method_declaration) @chunk]
          [(class_declaration) @chunk]
        `,
        go: `
          [(function_declaration) @chunk]
          [(method_declaration) @chunk]
          [(type_spec (struct_type)) @chunk]
        `,
        cpp: `
          [(function_definition) @chunk]
          [(class_specifier) @chunk]
        `,
    };
    
    const query = new Parser.Query(
      grammar,
      queryPatterns[lang] || queryPatterns['typescript'],
    );
    const matches = query.matches(tree.rootNode);

    if (matches.length > 0) {
      matches.forEach(match => {
        const node = match.captures[0].node;
        chunks.push(node.text);
      });
    } else {
       // 如果没有匹配到任何块，将整个文件作为一个块
       chunks.push(tree.rootNode.text);
    }

    return chunks;
  }
}
