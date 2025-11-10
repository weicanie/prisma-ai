import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessageChunk } from '@langchain/core/messages';
import { ChatOpenAICallOptions } from '@langchain/openai';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZodAny } from 'zod';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { FactoryService } from './services/factory.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { RequestQueueService } from './services/request-queue.service';
import { RetryService } from './services/retry.service';

export interface HAModelClientOptions {
	//熔断器配置
	circuitBreakerConfig: {
		failureThreshold: number;
		resetTimeout: number;
		timeout: number;
	};
	//限流器配置
	rateLimiterConfig: {
		maxRequestsPerMinute: number;
	};
	//重试配置
	retryConfig: {
		maxRetries: number;
		initialDelayMs: number;
		maxDelayMs: number;
		factor: number; //指数退避因子,越大退避得越激进
		retryableErrors: RegExp[];
	};
	//模型实例的请求队列配置
	modelRequestQueueConfig: {
		maxConcurrent: number;
	};
}

/**
 * @description 增强的ChatModel, 拦截invoke方法, 添加熔断器、限流器、指数退避重试、请求队列,实现模型服务的高可用
 *
 */
export class HAModelClient {
	//模型实例
	public model: BaseChatModel;
	//模型参数
	// private modelConfig: ChatOpenAIFields;
	//熔断器配置
	public circuitBreakerConfig: {
		failureThreshold: number;
		resetTimeout: number;
		timeout: number;
	};
	//限流器配置
	public rateLimiterConfig: {
		maxRequestsPerMinute: number;
	};
	//重试配置
	public retryConfig: {
		maxRetries: number;
		initialDelayMs: number;
		maxDelayMs: number;
		factor: number; //指数退避因子,越大退避得越激进
		retryableErrors: RegExp[];
	};
	//模型实例的请求队列配置
	public modelRequestQueueConfig: {
		maxConcurrent: number;
	};
	//创建客户端的函数
	private createClient: HAModelClientService['createClient'];

	private jsonMode: boolean = false;

	// 为每个模型实例创建独立的限流器
	private rateLimiter: RateLimiterService;
	// 为每个模型实例创建独立的请求队列
	private requestQueue: RequestQueueService;

	//langchain内部需要使用（从内部的ChatOpenAI里copy的）
	static lc_name() {
		return 'ChatOpenAI';
	}

	//要想成为chain的节点，必须"是"一个Runnable
	lc_runnable = true;
	modelConfig: Record<string, any>; //使用模型配置作为熔断器的key
	constructor(
		model: BaseChatModel,
		modelConfig: Record<string, any>, //使用模型配置作为熔断器的key
		config: HAModelClientOptions,
		private circuitBreakerService: CircuitBreakerService,
		private retryService: RetryService,
		private factory: FactoryService, // 传入限流器工厂服务
		createClient: HAModelClientService['createClient'],
		jsonMode = false
	) {
		this.model = model;
		this.modelConfig = modelConfig;
		this.circuitBreakerConfig = config.circuitBreakerConfig;
		this.rateLimiterConfig = config.rateLimiterConfig;
		this.retryConfig = config.retryConfig;
		this.modelRequestQueueConfig = config.modelRequestQueueConfig;
		this.createClient = createClient;
		this.jsonMode = jsonMode;

		// 为每个模型实例创建独立的限流器
		const rateLimitKey = JSON.stringify(this.modelConfig);
		this.rateLimiter = this.factory.getLimiter(
			rateLimitKey,
			config.rateLimiterConfig.maxRequestsPerMinute,
			60 * 60 * 1000 // 默认最大等待时间1小时
		);
		// 为每个模型实例创建独立的请求队列
		const requestQueueKey = JSON.stringify(this.modelConfig);
		this.requestQueue = this.factory.getQueue(
			requestQueueKey,
			this.modelRequestQueueConfig.maxConcurrent
		);
	}

	/**
	 * 开启 llm 的 JSON mode （目前不支持JSON schema）
	 * 这能确保返回的是有效的JSON
	 */
	withStructuredOutput(schema: ZodAny) {
		//! 组合withStructuredOutput时解析器会出错
		// const modelClass = this.model.constructor;
		// let newModel = new modelClass(this.modelConfig);
		// newModel = newModel.withStructuredOutput(schema, {
		// 	includeRaw: true,
		// 	method: 'jsonMode'
		// });
		const newClient = this.createClient(
			this.model,
			this.modelConfig,
			{
				circuitBreakerConfig: this.circuitBreakerConfig,
				rateLimiterConfig: this.rateLimiterConfig,
				retryConfig: this.retryConfig,
				modelRequestQueueConfig: this.modelRequestQueueConfig
			},
			true
		);
		return newClient;
	}

	async invoke(input: BaseLanguageModelInput, options?: ChatOpenAICallOptions): Promise<any> {
		if (this.jsonMode) {
			return this.request(input, false, { ...options, response_format: { type: 'json_object' } });
		} else {
			return this.request(input, false, { ...options, response_format: { type: 'text' } }); // ReturnType<BaseChatModel['invoke']>
		}
	}

	async stream(input: BaseLanguageModelInput, options?: ChatOpenAICallOptions): Promise<any> {
		return this.request(input, true, options); //ReturnType<BaseChatModel['stream']>
	}

	async request(
		input: BaseLanguageModelInput,
		stream = false,
		options?: ChatOpenAICallOptions
	): Promise<any> {
		// 构建“重试在前、熔断在后”的熔断器包装
		const modelWithBreakerInvoker = this.withBreaker();
		// 1. 首先通过限流控制
		const acquired = await this.rateLimiter.acquire();
		if (!acquired) {
			throw new HttpException(
				`${(this.model as any)?.model ?? '模型'}服务速率限制，请稍后重试`,
				HttpStatus.TOO_MANY_REQUESTS
			);
		}
		// 2. 然后进入请求队列
		return await this.requestQueue.enqueue<AIMessageChunk>(async () => {
			try {
				// 3. 在熔断器内执行（熔断器内部封装了重试逻辑）
				return await modelWithBreakerInvoker.fire(input, stream, options);
			} catch (error: any) {
				// 熔断已打开时，返回 503；否则保留原始错误
				// 现在的熔断器是直接抛出，所以一律保留原始错误
				const isBreakerOpen =
					error?.code === 'EOPENBREAKER' ||
					error?.name === 'OpenError' ||
					/breaker is open/i.test(error?.message || '');
				if (isBreakerOpen) {
					throw new HttpException(
						`${(this.model as any)?.model ?? '模型'}服务暂时不可用`,
						HttpStatus.SERVICE_UNAVAILABLE
					);
				}
				throw error;
			}
		});
	}

	private withBreaker() {
		// 将模型配置和运行时配置一起作为熔断器的key，确保不同配置有独立的熔断器实例
		const breakerKey = JSON.stringify(this.modelConfig);
		const breaker = this.circuitBreakerService.getBreaker(
			breakerKey,
			//! 如果breakerKey指向的实例存在，则不会创建新的实例，也不会传入新的此函数
			async (input: BaseLanguageModelInput, stream = false, options?: ChatOpenAICallOptions) => {
				// 编排：在熔断器包装的函数内部执行"重试"，从而避免可重试错误触发熔断
				return this.retryService.exponentialBackoff(
					() =>
						(stream ? this.model.stream(input, options) : this.model.invoke(input, options)) as any,
					{
						maxRetries: this.retryConfig.maxRetries,
						initialDelayMs: this.retryConfig.initialDelayMs,
						maxDelayMs: this.retryConfig.maxDelayMs,
						factor: this.retryConfig.factor,
						retryableErrors: this.retryConfig.retryableErrors
					}
				);
			},
			this.circuitBreakerConfig
		);
		return breaker;
	}
}

@Injectable()
export class HAModelClientService {
	constructor(
		private circuitBreakerService: CircuitBreakerService,
		private retryService: RetryService,
		private factory: FactoryService,
		private configService: ConfigService
	) {}

	createClient(
		model: BaseChatModel,
		modelConfig: Record<string, any>, //使用模型配置作为熔断器的key
		{
			circuitBreakerConfig,
			rateLimiterConfig,
			retryConfig,
			modelRequestQueueConfig
		}: HAModelClientOptions = {
			circuitBreakerConfig: {
				failureThreshold: 40,
				//llm非流式输出有时会很慢
				resetTimeout: 20 * 60 * 1000, //20分钟后半开
				timeout: 30 * 60 * 1000 //30分钟超时视为失败
			},
			rateLimiterConfig: {
				maxRequestsPerMinute: 60 //默认每分钟最多60次请求
			},
			retryConfig: {
				maxRetries: 7,
				initialDelayMs: 10000, //10s 20s 40s 80s 160s 320s 640s
				maxDelayMs: 100000,
				factor: 2,
				retryableErrors: [
					/429/, // 速率限制错误
					/503/, // 服务不可用
					/timeout/i, // 超时错误
					/ECONNRESET/, // 连接重置
					/ETIMEDOUT/ // 连接超时
				]
			},
			modelRequestQueueConfig: {
				maxConcurrent: this.configService.get<number>('modelRequestQueueConfig_maxConcurrent') ?? 20 //默认该模型实例的最大请求并发为20
			}
		},
		jsonMode = false
	) {
		const config: HAModelClientOptions = {
			circuitBreakerConfig,
			rateLimiterConfig,
			retryConfig,
			modelRequestQueueConfig
		};
		return new HAModelClient(
			model,
			modelConfig,
			config,
			this.circuitBreakerService,
			this.retryService,
			this.factory,
			this.createClient,
			jsonMode
		);
	}
}
