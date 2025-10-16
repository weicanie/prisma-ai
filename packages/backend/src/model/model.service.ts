import { ChatDeepSeek } from '@langchain/deepseek';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIChatInput } from '@langchain/google-genai';
import {
	ChatOpenAI,
	ChatOpenAIFields,
	ClientOptions,
	OpenAIEmbeddings,
	OpenAIEmbeddingsParams
} from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserConfig } from '@prisma-ai/shared';
import { ChatHistoryService } from './chat_history.service';
import {
	HAModelClient,
	HAModelClientOptions,
	HAModelClientService
} from './HAModelClient/HAModelClient.service';

export enum QwenNeed {
	low = 'low', //简单任务
	medium = 'medium', //普通任务
	high = 'high' //复杂任务
}

export enum QwenModel {
	//简单任务
	qwen3_30b_a3b_thinking_2507 = 'qwen3-30b-a3b-thinking-2507', //好
	qwen_max_2025_01_25 = 'qwen-max-2025-01-25', //一般

	//普通任务
	qwen_plus = 'qwen-plus', //一般
	qwen3_30b_a3b_instruct_2507 = 'qwen3-30b-a3b-instruct-2507', //小参数适合简单任务
	qwen_max_latest = 'qwen-max-latest', //一般

	//复杂任务
	qwen_plus_latest = 'qwen-plus-latest', //较好
	qwen3_235b_a22b_instruct_2507 = 'qwen3-235b-a22b-instruct-2507', //好
	qwen3_235b_a22b_thinking_2507 = 'qwen3-235b-a22b-thinking-2507' //较好
}

export enum GlmNeed {
	low = 'low', //简单任务
	medium = 'medium', //普通任务
	high = 'high' //复杂任务
}

export enum GlmModel {
	// glm-4.5-air 适合简单、普通任务
	glm_4_5_air = 'glm-4.5-air',
	// glm-4.5 适合复杂任务
	glm_4_5 = 'glm-4.5'
}

type EmbedOpenAIFields = Partial<OpenAIEmbeddingsParams> & {
	verbose?: boolean;
	openAIApiKey?: string;
	apiKey?: string;
	configuration?: ClientOptions;
};

@Injectable()
export class ModelService {
	logger = new Logger(ModelService.name);
	/**
	 * 模型池: config -> HAModelClient模型实例 的哈希表
	 *
	 * @description config 相同则复用模型实例,否则创建新的模型实例
	 */
	private models: Map<string, HAModelClient> = new Map();

	/**
	 * 模型池: config -> ChatOpenAI模型实例 的哈希表
	 *
	 * @description 需要langsmith的完整可观测性时使用（HAModelClient模型实例可观测性支持有限）
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

	kimi_config: ChatOpenAIFields = {
		model: 'kimi-k2-0711-preview',
		configuration: {
			apiKey: this.configService.get('API_KEY_KIMI'),
			timeout: 600000,
			baseURL: this.configService.get('BASE_URL_KIMI')
		}
	};

	//国内代理
	gemini_config: ChatOpenAIFields = {
		model: 'gemini-2.5-pro',
		configuration: {
			apiKey: this.configService.get('OPENAI_API_KEY'),
			timeout: 600000,
			baseURL: this.configService.get('OPENAI_API_BASE_URL'),
			maxRetries: 3
		}
	};
	//google原厂
	gemini_config_plus: GoogleGenerativeAIChatInput = {
		model: 'gemini-2.5-pro',
		apiKey: this.configService.get('GOOGLEAI_API_KEY')
	};

	constructor(
		public chatHistoryService: ChatHistoryService,
		public HAModelClientService: HAModelClientService,
		public configService: ConfigService
	) {
		try {
			//初始化模型池
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
			const raw_kimi = new ChatOpenAI(this.kimi_config);
			this.rawModels.set(JSON.stringify(this.kimi_config), raw_kimi);

			//@ts-no-check 类型递归过深
			const LLM_openai = this.HAModelClientService.createClient(raw_openai, this.openai_config);
			//@ts-no-check
			const LLM_deepseek = this.HAModelClientService.createClient(
				raw_deepseek,
				this.deepseek_config
			);
			//@ts-no-check
			const LLM_gemini = this.HAModelClientService.createClient(raw_gemini, this.gemini_config);
			//@ts-no-check
			const LLM_kimi = this.HAModelClientService.createClient(raw_kimi, this.kimi_config);
			this.models.set(JSON.stringify(this.openai_config), LLM_openai);
			this.models.set(JSON.stringify(this.deepseek_config), LLM_deepseek);
			this.models.set(JSON.stringify(this.gemini_config), LLM_gemini);
			this.models.set(JSON.stringify(this.kimi_config), LLM_kimi);
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
			this.logger.log('模型池初始化成功');
		} catch (error) {
			this.logger.error('模型池初始化失败，线上部署请忽略:', error);
		}
	}

	/**
	 * 获取openai以及兼容openai的模型客户端
	 *
	 * @description 模型实例,具有熔断器和限流器和请求队列等高可用保护。
	 * @param [config] - 模型配置
	 * @param [HAConfig={}] - 高可用配置
	 */
	async getLLMOpenAI(config = this.openai_config, HAConfig?: HAModelClientOptions) {
		const configKey = JSON.stringify({ ...config, HAConfig });
		if (this.models.has(configKey)) {
			return this.models.get(configKey);
		} else {
			const newModel = this.HAModelClientService.createClient(
				new ChatOpenAI(config),
				config,
				HAConfig
			);
			this.models.set(JSON.stringify({ ...config, HAConfig }), newModel);
			return newModel;
		}
	}

	/**
	 * @description 模型实例,具有熔断器和限流器和请求队列等高可用保护。
	 * @param [config] - 模型配置
	 * @param [HAConfig={}] - 高可用配置
	 */
	async getLLMDeepSeek(
		config = this.deepseek_config,
		HAConfig?: HAModelClientOptions
	): Promise<ChatDeepSeek> {
		const configKey = JSON.stringify({ ...config, HAConfig });
		if (this.models.has(configKey)) {
			return this.models.get(configKey) as unknown as ChatDeepSeek;
		} else {
			const deepseekConfig = {
				...config,
				...config.configuration,
				configuration: undefined
			};
			const newModel = this.HAModelClientService.createClient(
				new ChatDeepSeek(deepseekConfig),
				config,
				HAConfig
			);
			this.models.set(JSON.stringify({ ...config, HAConfig }), newModel);
			return newModel as unknown as ChatDeepSeek;
		}
	}

	/**
	 * gemini原厂
	 */
	async getLLMGemini(config = this.gemini_config_plus, HAConfig?: HAModelClientOptions) {
		const configKey = JSON.stringify({ ...config, HAConfig });
		if (this.models.has(configKey)) {
			return this.models.get(configKey);
		} else {
			const newModel = this.HAModelClientService.createClient(
				new ChatGoogleGenerativeAI(config),
				config,
				HAConfig
			);
			this.models.set(JSON.stringify({ ...config, HAConfig }), newModel);
			return newModel;
		}
	}

	/**
	 * 获取qwen模型
	 *
	 * @description 当不指定模型名称时，根据任务难度随机选择一个模型。
	 * @param apiKey qwen apiKey
	 * @param need 任务难度
	 * @param modelName qwen模型名称（可选）
	 * @returns qwen模型实例
	 */
	async qwenModelpool({
		apiKey,
		need,
		modelName
	}: {
		need: QwenNeed;
		apiKey: string;
		modelName?: QwenModel;
	}): Promise<ChatOpenAI> {
		// 如果传入了 modelName，直接使用该模型
		let selectedModel: QwenModel;

		if (modelName) {
			selectedModel = modelName;
		} else {
			// 根据 need 参数映射到对应的模型数组
			const modelMapping: Record<QwenNeed, QwenModel[]> = {
				[QwenNeed.low]: [QwenModel.qwen3_30b_a3b_thinking_2507, QwenModel.qwen_max_2025_01_25],
				[QwenNeed.medium]: [
					QwenModel.qwen3_30b_a3b_instruct_2507,

					QwenModel.qwen_plus,
					QwenModel.qwen_max_latest
				],
				[QwenNeed.high]: [
					QwenModel.qwen_plus_latest,
					QwenModel.qwen3_235b_a22b_instruct_2507,
					QwenModel.qwen3_235b_a22b_thinking_2507
				]
			};

			// 获取对应难度级别的模型数组
			const availableModels = modelMapping[need];

			// 随机选择其中一个模型
			const randomIndex = Math.floor(Math.random() * availableModels.length);
			selectedModel = availableModels[randomIndex];
		}

		// 使用选定的模型调用 getLLMOpenAI
		const model = this.getLLMOpenAI({
			model: selectedModel,
			configuration: {
				apiKey,
				timeout: 600000,
				baseURL: this.configService.get('BASE_URL_QWEN'),
				maxRetries: 3
			}
		});

		return model as unknown as ChatOpenAI;
	}

	async glmModelpool({
		apiKey,
		need,
		modelName
	}: {
		need: GlmNeed;
		apiKey: string;
		modelName?: GlmModel;
	}): Promise<ChatOpenAI> {
		// 如果传入了 modelName，直接使用该模型
		let selectedModel: GlmModel;

		if (modelName) {
			selectedModel = modelName;
		} else {
			// 根据 need 参数映射到对应的模型数组
			const modelMapping: Record<GlmNeed, GlmModel[]> = {
				[GlmNeed.low]: [GlmModel.glm_4_5_air],
				[GlmNeed.medium]: [GlmModel.glm_4_5_air],
				[GlmNeed.high]: [GlmModel.glm_4_5]
			};

			// 获取对应难度级别的模型数组
			const availableModels = modelMapping[need];

			// 随机选择其中一个模型
			const randomIndex = Math.floor(Math.random() * availableModels.length);
			selectedModel = availableModels[randomIndex];
		}

		// 使用选定的模型调用 getLLMOpenAI
		const model = this.getLLMOpenAI({
			model: selectedModel,
			maxTokens: 32000,
			configuration: {
				apiKey,
				timeout: 600000,
				baseURL: this.configService.get('BASE_URL_ZHIPU'),
				maxRetries: 3
			}
		});

		return model as unknown as ChatOpenAI;
	}

	/**
	 * @description 获取单例的嵌入模型实例
	 */
	getEmbedModelOpenAI(userConfig: UserConfig | null) {
		if (!userConfig) {
			return this.embedModel_openai;
		} else {
			const embedModel_openai_config: EmbedOpenAIFields = {
				model: 'text-embedding-3-small',
				configuration: {
					apiKey: userConfig.llm.openai.apiKey,
					timeout: 6000,
					baseURL: userConfig.llm.openai.baseUrl,
					maxRetries: 1
				}
			};
			return new OpenAIEmbeddings(embedModel_openai_config);
		}
	}

	getChatHistory(keyname: string) {
		return this.chatHistoryService.getChatHistory(keyname);
	}

	getLLMGeminiRaw(modelName: 'gemini-2.5-pro' | 'gemini-2.5-flash', apiKey?: string): ChatOpenAI;
	getLLMGeminiRaw(config: ChatOpenAIFields, apiKey?: string): ChatOpenAI;

	/**
	 * @description 直接获取模型实例,无熔断器和限流器和请求队列等高可用保护
	 * @description 目前使用的是国内转发接口,所以需要使用ChatOpenAI
	 * @param [config] - 模型配置
	 */
	getLLMGeminiRaw(config: any, apiKey?: string) {
		if (config === 'gemini-2.5-pro' || config === 'gemini-2.5-flash') {
			//测试阶段使用gemini-1.5-flash-latest
			const modelName = config;
			config = this.gemini_config;
			config.model = modelName;
		} else if (config === undefined) {
			config = this.gemini_config;
		}
		if (apiKey) {
			config.apiKey = apiKey;
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
	getLLMGeminiPlusRaw(config: GoogleGenerativeAIChatInput, apiKey?: string): ChatGoogleGenerativeAI;
	getLLMGeminiPlusRaw(
		modelName: 'gemini-2.5-pro' | 'gemini-2.5-flash',
		apiKey?: string
	): ChatGoogleGenerativeAI;

	getLLMGeminiPlusRaw(config: any, apiKey?: string) {
		if (config === 'gemini-2.5-pro' || config === 'gemini-2.5-flash') {
			const modelName = config;
			config = this.gemini_config_plus;
			config.model = modelName;
		} else if (config === undefined) {
			config = this.gemini_config_plus;
		}

		if (apiKey) {
			config.apiKey = apiKey;
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

	getLLMOpenAIRaw(config?: ChatOpenAIFields): ChatOpenAI;

	/**
	 * @description 直接获取模型实例,无熔断器和限流器和请求队列等高可用保护
	 * @param [config] - 模型配置
	 */
	getLLMOpenAIRaw(config = this.openai_config) {
		const configKey = JSON.stringify(config);
		if (this.rawModels.has(configKey)) {
			return this.rawModels.get(configKey)!;
		} else {
			const newModel = new ChatOpenAI(config);
			this.rawModels.set(JSON.stringify(config), newModel);
			return newModel;
		}
	}

	getLLMDeepSeekRaw(config: ChatOpenAIFields, apiKey?: string): ChatDeepSeek;
	getLLMDeepSeekRaw(
		modelName: 'deepseek-reasoner' | 'deepseek-chat',
		apiKey?: string
	): ChatDeepSeek;

	/**
	 * @description 直接获取模型实例,无熔断器和限流器和请求队列等高可用保护
	 * @param [config] - 模型配置
	 */
	getLLMDeepSeekRaw(config: any, apiKey?: string) {
		if (config === 'deepseek-reasoner' || config === 'deepseek-chat') {
			const modelName = config;
			config = this.deepseek_config;
			config.model = modelName;
		} else if (config === undefined) {
			config = this.deepseek_config;
		}

		if (apiKey) {
			config.configuration.apiKey = apiKey;
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
}
