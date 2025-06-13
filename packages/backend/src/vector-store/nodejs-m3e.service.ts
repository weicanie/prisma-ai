import { Embeddings } from '@langchain/core/embeddings';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as path from 'path';

/**
 * @class NodejsM3eService
 * @description
 * 这是一个集成的服务类，负责管理本地M3E嵌入模型的生命周期和使用。
 * 它作为一个 NestJS 的可注入服务 (Provider)，同时直接继承了 LangChain 的 `Embeddings` 类。
 * 这样的设计使得该服务可以直接被 LangChain 的相关模块（如 VectorStore）使用，无需任何适配器。
 *
 * 主要职责:
 * 1. 在模块初始化时（`onModuleInit`），异步加载和初始化本地的 ONNX 模型。
 * 2. 实现 `embedDocuments` 和 `embedQuery` 方法，以符合 LangChain `Embeddings` 类的要求。
 * 3. 封装了模型加载的复杂性，包括处理路径问题和确保模型只被加载一次（单例模式）。
 */
@Injectable()
export class NodejsM3eService extends Embeddings implements OnModuleInit {
	private readonly logger = new Logger(NodejsM3eService.name);
	private embeddingPipeline: any = null; // 用于存储已初始化的模型管道

	// 本地模型的标识符，对应 `models` 文件夹下的路径
	private readonly modelName = 'moka-ai/m3e-base';

	constructor() {
		// 调用父类（Embeddings）的构造函数
		super({});
	}

	/**
	 * @description
	 * NestJS 模块初始化时调用的生命周期钩子。
	 * 在这里执行模型的异步加载和初始化。
	 */
	async onModuleInit() {
		this.logger.log('开始初始化本地 M3E 嵌入模型...');
		try {
			// 获取模型管道的单例
			this.embeddingPipeline = await EmbeddingPipeline.getInstance(this.modelName);
			this.logger.log('本地 M3E 嵌入模型初始化成功。');

			// 执行一次测试嵌入，以验证模型是否正常工作
			const testVector = await this.embedQuery('test');
			this.logger.log(`模型测试成功。向量维度: ${testVector.length}`);
		} catch (error) {
			this.logger.error('初始化本地 M3E 嵌入模型失败。', error.stack);
			// 抛出错误，阻止应用启动，因为这是一个关键服务
			throw new Error('严重错误: 无法初始化本地嵌入模型。');
		}
	}

	/**
	 * @description
	 * LangChain `Embeddings` 类的核心方法之一。
	 * 接收一个字符串数组，为每个字符串生成嵌入向量。
	 * @param documents 要嵌入的文档（字符串）数组。
	 * @returns 一个包含所有嵌入向量的二维数组 Promise。
	 */
	async embedDocuments(documents: string[]): Promise<number[][]> {
		if (!this.embeddingPipeline) {
			this.logger.error('嵌入管道未初始化，无法生成文档向量。');
			throw new Error('嵌入管道不可用');
		}
		// 库的 pipeline 方法支持批处理，这比循环调用更高效
		const results = await this.embeddingPipeline(documents, {
			pooling: 'mean',
			normalize: true
		});
		// .tolist() 方法将 Tensor 转换为标准的 JS 嵌套数组
		return results.tolist();
	}

	/**
	 * @description
	 * LangChain `Embeddings` 类的核心方法之一。
	 * 接收单个字符串（通常用于查询），并为其生成嵌入向量。
	 * @param document 要嵌入的查询文本。
	 * @returns 一个包含嵌入向量的一维数组 Promise。
	 */
	async embedQuery(document: string): Promise<number[]> {
		if (!this.embeddingPipeline) {
			this.logger.error('嵌入管道未初始化，无法生成查询向量。');
			throw new Error('嵌入管道不可用');
		}
		// 使用模型管道处理单个查询
		const result = await this.embeddingPipeline(document, {
			pooling: 'mean',
			normalize: true
		});
		// .tolist() 方法将 Tensor 转换为标准的 JS 数组
		return result.tolist();
	}
}

/**
 * @class EmbeddingPipeline
 * @description
 * 一个内部辅助类，使用单例模式来确保模型在整个应用生命周期中只被加载一次。
 * 这对于内存和性能至关重要，因为加载模型是一个昂贵的操作。
 */
class EmbeddingPipeline {
	private static instance: any; // 存储管道的单例实例
	private static readonly task = 'feature-extraction' as const; // 定义任务类型

	/**
	 * @description
	 * 获取模型管道的单例实例。如果实例不存在，则创建它。
	 * @param modelName 要加载的模型的名称。
	 */
	static async getInstance(modelName: string) {
		if (!this.instance) {
			// 动态导入 transformers 库，以支持 CommonJS 环境
			const { pipeline, env: transformerEnv } = await import('@xenova/transformers');

			// 计算 'models' 文件夹的绝对路径
			let modelsPath = path.join(__dirname, '..', '..', '..', '..', 'models');

			// 兼容 Windows 路径：将反斜杠（\）替换为正斜杠（/）
			if (process.platform === 'win32') {
				modelsPath = modelsPath.replace(/\\/g, '/');
			}

			// 直接在库的配置对象上设置参数，这是最可靠的方式
			transformerEnv.localModelPath = modelsPath; // 指定本地模型的根目录
			transformerEnv.allowRemoteModels = false; // 禁止从远程下载模型
			transformerEnv.allowLocalModels = true; // 允许加载本地模型

			console.log(`[EmbeddingPipeline] 已设置本地模型路径: ${modelsPath}`);

			// 创建管道实例
			// `quantized: false` 确保它加载我们转换的 `model.onnx` 而不是 `model_quantized.onnx`
			this.instance = await pipeline(this.task, modelName, {
				quantized: false
			});
		}
		return this.instance;
	}
}
