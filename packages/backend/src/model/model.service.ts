import {
	ChatOpenAI,
	ChatOpenAIFields,
	ClientOptions,
	OpenAIEmbeddings,
	OpenAIEmbeddingsParams
} from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { ChatHistoryService } from './chat_history.service';
import {
	HAModelClient,
	HAModelClientService
} from './HAModelClient/services/HAModelClient.service';
import { ToolBinding } from './model.types';

type EmbedOpenAIFields = Partial<OpenAIEmbeddingsParams> & {
	verbose?: boolean;
	openAIApiKey?: string;
	apiKey?: string;
	configuration?: ClientOptions;
};

@Injectable()
export class ModelService {
	/**
	 * @description 模型池: config -> HAModelClient模型实例 的哈希表
	 * @description config 相同则复用模型实例,否则创建新的模型实例
	 */
	private models: Map<string, ChatOpenAI> = new Map();

	/**
	 * @description 模型池: config -> ChatOpenAI模型实例 的哈希表
	 * @description config 相同则复用模型实例,否则创建新的模型实例
	 */
	private rawModels: Map<string, ChatOpenAI> = new Map();
	/**
	 * @description 单例的嵌入模型实例
	 */
	public embedModel_openai: OpenAIEmbeddings;

	//默认模型配置
	openai_config: ChatOpenAIFields = {
		model: 'gpt-4o-mini',
		configuration: {
			apiKey: this.configService.get('OPENAI_API_KEY'),
			timeout: 6000,
			baseURL: this.configService.get('OPENAI_API_BASE_URL'),
			maxRetries: 3
		}
	};
	deepseek_config: ChatOpenAIFields = {
		model: 'deepseek-reasoner',
		configuration: {
			apiKey: this.configService.get('API_KEY_DEEPSEEK'),
			timeout: 6000,
			baseURL: this.configService.get('BASE_URL_DEEPSEEK'),
			maxRetries: 3
		}
	};

	constructor(
		public chatHistoryService: ChatHistoryService,
		public HAModelClientService: HAModelClientService,
		// @Inject(ConfigService)
		public configService: ConfigService
	) {
		//初始化模型池

		this.rawModels.set(JSON.stringify(this.openai_config), new ChatOpenAI(this.openai_config));
		this.rawModels.set(JSON.stringify(this.deepseek_config), new ChatOpenAI(this.deepseek_config));
		//TODO 这样能行? 不行就放onMuduleInit里
		const LLM_openai = this.HAModelClientService.createClient({ modelConfig: this.openai_config });
		const LLM_deepseek = this.HAModelClientService.createClient({
			modelConfig: this.deepseek_config
		});
		this.models.set(JSON.stringify(this.openai_config), LLM_openai);
		this.models.set(JSON.stringify(this.deepseek_config), LLM_deepseek);

		//embedModel 单例
		const embedModel_openai_config: EmbedOpenAIFields = {
			model: 'text-embedding-3-small',
			configuration: {
				apiKey: this.configService.get('OPENAI_API_KEY'),
				timeout: 6000,
				baseURL: this.configService.get('OPENAI_API_BASE_URL'),
				maxRetries: 1
			}
		};
		this.embedModel_openai = new OpenAIEmbeddings(embedModel_openai_config);
	}

	/**
	 * @description 模型实例,具有熔断器和限流器和请求队列等高可用保护。
	 * @param [config] - 模型配置
	 * @param [HAConfig={}] - 高可用配置
	 * @example 
	 * HAConfig示例:
	 * ```ts
	 * {
	 * 	circuitBreakerConfig: {
				failureThreshold: 40,
				resetTimeout: 20000 
			},
			rateLimiterConfig: {
				maxRequestsPerMinute: 60
			},
			retryConfig: {
				maxRetries: 4,
				initialDelayMs: 1000,
				maxDelayMs: 15000,
				factor: 2,
				retryableErrors: [
					/429/, // 速率限制错误
					/503/, // 服务不可用
					/timeout/i, // 超时错误
					/ECONNRESET/, // 连接重置
					/ETIMEDOUT/ // 连接超时
				]
			}
	 * }
	 * ```
	 */
	async getLLMOpenAI(config = this.openai_config, HAConfig = {}) {
		const configKey = JSON.stringify(config);
		if (this.models.has(configKey)) {
			return this.models.get(configKey);
		} else {
			const newModel = this.HAModelClientService.createClient({
				modelConfig: this.openai_config,
				...HAConfig
			});
			this.models.set(JSON.stringify(config), newModel);
			return newModel;
		}
	}

	/**
	 * @description 模型实例,具有熔断器和限流器和请求队列等高可用保护。
	 * @param [config] - 模型配置
	 * @param [HAConfig={}] - 高可用配置
	 * @example 
	 * HAConfig示例:
	 * ```ts
	 * {
	 * 	circuitBreakerConfig: {
				failureThreshold: 40,
				resetTimeout: 20000 
			},
			rateLimiterConfig: {
				maxRequestsPerMinute: 60
			},
			retryConfig: {
				maxRetries: 4,
				initialDelayMs: 1000,
				maxDelayMs: 15000,
				factor: 2,
				retryableErrors: [
					/429/, // 速率限制错误
					/503/, // 服务不可用
					/timeout/i, // 超时错误
					/ECONNRESET/, // 连接重置
					/ETIMEDOUT/ // 连接超时
				]
			}
	 * }
	 * ```
	 */
	async getLLMDeepSeek(config = this.deepseek_config, HAConfig = {}) {
		const configKey = JSON.stringify(config);
		if (this.models.has(configKey)) {
			return this.models.get(configKey);
		} else {
			const newModel = this.HAModelClientService.createClient({
				modelConfig: this.openai_config,
				...HAConfig
			});
			this.models.set(JSON.stringify(config), newModel);
			return newModel;
		}
	}

	/**
	 * @description 直接获取模型实例,无熔断器和限流器和请求队列等高可用保护
	 * @param [config] - 模型配置
	 */
	getLLMOpenAIRaw(config = this.openai_config) {
		const configKey = JSON.stringify(config);
		if (this.rawModels.has(configKey)) {
			return this.rawModels.get(configKey);
		} else {
			const newModel = new ChatOpenAI(config);
			this.rawModels.set(JSON.stringify(config), newModel);
			return newModel;
		}
	}

	/**
	 * @description 直接获取模型实例,无熔断器和限流器和请求队列等高可用保护
	 * @param [config] - 模型配置
	 */
	getLLMDeepSeekRaw(config = this.deepseek_config) {
		const configKey = JSON.stringify(config);
		if (this.rawModels.has(configKey)) {
			return this.rawModels.get(configKey);
		} else {
			const newModel = new ChatOpenAI(config);
			this.rawModels.set(JSON.stringify(config), newModel);
			return newModel;
		}
	}
	/**
	 * @description 返回绑定工具及其行为后的模型
	 * @param toolBinding - 指定 llm 可用的 tools 和行为限制
	 */
	static bindTools(model: HAModelClient | ChatOpenAI, toolBinding: ToolBinding) {
		const modelBindingTools = model.bind(toolBinding);
		return modelBindingTools;
	}

	/**
	 * @description 获取单例的嵌入模型实例
	 */
	async getEmbedModelOpenAI() {
		return this.embedModel_openai;
	}

	getChatHistory(
		sessionId = 'json_chat_history',
		dir = path.join(process.cwd(), '/chat_history_data')
	) {
		return this.chatHistoryService.getChatHistory(sessionId, dir);
	}
}
