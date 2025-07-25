import { ChatDeepSeek } from '@langchain/deepseek';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIChatInput } from '@langchain/google-genai';
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
import { HAModelClient, HAModelClientService } from './HAModelClient/HAModelClient.service';

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
	private models: Map<string, HAModelClient> = new Map();

	/**
	 * @description 模型池: config -> ChatOpenAI模型实例 的哈希表
	 * @description config 相同则复用模型实例,否则创建新的模型实例
	 */
	private rawModels: Map<string, ChatOpenAI | ChatDeepSeek | ChatGoogleGenerativeAI> = new Map();

	/**
	 * @description 单例的嵌入模型实例
	 */
	public embedModel_openai: OpenAIEmbeddings;

	//默认模型配置
	openai_config: ChatOpenAIFields = {
		model: 'gpt-4o-mini',
		configuration: {
			apiKey: this.configService.get('OPENAI_API_KEY'),
			timeout: 600000,
			baseURL: this.configService.get('OPENAI_API_BASE_URL'),
			maxRetries: 3
		}
	};

	deepseek_config: ChatOpenAIFields = {
		model: 'deepseek-reasoner',
		configuration: {
			apiKey: this.configService.get('API_KEY_DEEPSEEK'),
			timeout: 600000,
			baseURL: this.configService.get('BASE_URL_DEEPSEEK'),
			maxRetries: 3
		}
	};

	//国内代理
	gemini_config : ChatOpenAIFields = {
		model: 'gemini-2.5-pro',
		configuration: {
			apiKey: this.configService.get('OPENAI_API_KEY'),
			timeout: 600000,
			baseURL: this.configService.get('OPENAI_API_BASE_URL'),
			maxRetries: 3
		}
	}
	//google原厂
	gemini_config_plus : GoogleGenerativeAIChatInput = {
		model: 'gemini-2.5-pro',
		apiKey: this.configService.get('GOOGLEAI_API_KEY'),
		//FIXME 难道是gemini本身必须直接设置streaming: true,json: true来支持流式输出和结构化输出???
		// streaming: true,
		// json: true
	}

	defaultHAConfig = {
		circuitBreakerConfig: {
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
	};

	constructor(
		public chatHistoryService: ChatHistoryService,
		public HAModelClientService: HAModelClientService,
		public configService: ConfigService
	) {
		//初始化模型池
		/* 
		ChatDeepSeek、ChatOpenAI：基本无差异、因为模型是对齐的
		 */
		const raw_openai = new ChatOpenAI(this.openai_config);
		this.rawModels.set(JSON.stringify(this.openai_config), raw_openai);
		/* ChatOpenAI格式转为ChatDeepSeek格式,配置和键统一保持为ChatOpenAI格式 */
		const deepseekConfig = {
			...this.deepseek_config,
			...this.deepseek_config.configuration,
			configuration: undefined
		};
		const raw_deepseek = new ChatDeepSeek(deepseekConfig);
		this.rawModels.set(JSON.stringify(this.deepseek_config), raw_deepseek);

		const raw_gemini = new ChatOpenAI(this.gemini_config);
		this.rawModels.set(JSON.stringify(this.gemini_config), raw_gemini);

		const raw_gemini_plus = new ChatGoogleGenerativeAI(this.gemini_config_plus);
		this.rawModels.set(JSON.stringify(this.gemini_config_plus), raw_gemini_plus);

		const LLM_openai = this.HAModelClientService.createClient({
			model: raw_openai,
			...this.defaultHAConfig
		});
		const LLM_deepseek = this.HAModelClientService.createClient({
			model: raw_deepseek,
			...this.defaultHAConfig
		});
		const LLM_gemini = this.HAModelClientService.createClient({
			model: raw_gemini,
			...this.defaultHAConfig
		});
		this.models.set(JSON.stringify(this.openai_config), LLM_openai);
		this.models.set(JSON.stringify(this.deepseek_config), LLM_deepseek);
		this.models.set(JSON.stringify(this.gemini_config), LLM_gemini);

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
				model: new ChatOpenAI(config),
				...this.defaultHAConfig,
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
			const deepseekConfig = {
				...config,
				...config.configuration,
				configuration: undefined
			};
			const newModel = this.HAModelClientService.createClient({
				model: new ChatDeepSeek(deepseekConfig),
				...this.defaultHAConfig,
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
	 */
	async getLLMGemini(config = this.gemini_config, HAConfig = {}) {
		const configKey = JSON.stringify(config);
		if (this.models.has(configKey)) {
			return this.models.get(configKey);
		} else {
			const newModel = this.HAModelClientService.createClient({
				model: new ChatGoogleGenerativeAI(config as any),
				...this.defaultHAConfig,
				...HAConfig
			});
			this.models.set(JSON.stringify(config), newModel);
			return newModel;
		}
	}

	getLLMGeminiRaw(modelName: 'gemini-2.5-pro' | 'gemini-2.5-flash'): ChatOpenAI;
	getLLMGeminiRaw(config: ChatOpenAIFields): ChatOpenAI;

	/**
	 * @description 直接获取模型实例,无熔断器和限流器和请求队列等高可用保护
	 * @description 目前使用的是国内转发接口,所以需要使用ChatOpenAI
	 * @param [config] - 模型配置
	 */
	getLLMGeminiRaw(config: any) {
		if (config === 'gemini-2.5-pro' || config === 'gemini-2.5-flash') {
			//测试阶段使用gemini-1.5-flash-latest
			const modelName = config;
			config = this.gemini_config;
			config.model = modelName;
		} else if (config === undefined) {
			config = this.gemini_config;
		}
		const configKey = JSON.stringify(config);
		if (this.rawModels.has(configKey)) {
			return this.rawModels.get(configKey)!;
		} else {
			const newModel = new ChatOpenAI(config);
			this.rawModels.set(JSON.stringify(config), newModel);
			return newModel;
		}
	}

	/**
	 * google原厂模型实例
	 */
	getLLMGeminiPlusRaw(config: GoogleGenerativeAIChatInput): ChatGoogleGenerativeAI;
	getLLMGeminiPlusRaw(modelName: 'gemini-2.5-pro' | 'gemini-2.5-flash'): ChatGoogleGenerativeAI;

	getLLMGeminiPlusRaw(config: any) {
		if (config === 'gemini-2.5-pro' || config === 'gemini-2.5-flash') {
			const modelName = config;
			config = this.gemini_config_plus;
			config.model = modelName;
		} else if (config === undefined) {
			config = this.gemini_config_plus;
		}
		const configKey = JSON.stringify(config);
		if (this.rawModels.has(configKey)) {
			return this.rawModels.get(configKey)!;
		} else {
			const newModel = new ChatGoogleGenerativeAI(config);
			this.rawModels.set(JSON.stringify(config), newModel);
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
			return this.rawModels.get(configKey)!;
		} else {
			const newModel = new ChatDeepSeek(config);
			this.rawModels.set(JSON.stringify(config), newModel);
			return newModel;
		}
	}

	getLLMDeepSeekRaw(config?: ChatOpenAIFields): ChatDeepSeek;
	getLLMDeepSeekRaw(modelName: 'deepseek-reasoner' | 'deepseek-chat'): ChatDeepSeek;

	/**
	 * @description 直接获取模型实例,无熔断器和限流器和请求队列等高可用保护
	 * @param [config] - 模型配置
	 */
	getLLMDeepSeekRaw(config: any) {
		if (config === 'deepseek-reasoner' || config === 'deepseek-chat') {
			const modelName = config;
			config = this.deepseek_config;
			config.model = modelName;
		} else if (config === undefined) {
			config = this.deepseek_config;
		}
		const configKey = JSON.stringify(config);
		if (this.rawModels.has(configKey)) {
			return this.rawModels.get(configKey);
		} else {
			//ChatOpenAIFields -> ChatDeepSeekFields
			const deepseekConfig = {
				...config,
				...config.configuration,
				configuration: undefined
			};
			const newModel = new ChatDeepSeek(deepseekConfig);
			this.rawModels.set(JSON.stringify(config), newModel);
			return newModel;
		}
	}

	/**
	 * @description 获取单例的嵌入模型实例
	 */
	getEmbedModelOpenAI() {
		return this.embedModel_openai;
	}

	getChatHistory(
		sessionId = 'json_chat_history',
		dir = path.join(process.cwd(), 'ai_data/chat_history_data')
	) {
		return this.chatHistoryService.getChatHistory(sessionId, dir);
	}
}
