import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessageChunk } from '@langchain/core/messages';
import { ChatOpenAICallOptions } from '@langchain/openai';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { RequestQueueService } from './services/request-queue.service';
import { RetryService } from './services/retry.service';

interface HAModelClientOptions {
	//模型实例
	model: BaseChatModel;
	//熔断器配置
	circuitBreakerConfig: {
		failureThreshold: number;
		resetTimeout: number;
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
}

/**
 * @description 体操 递归地将所有属性变为可选
 */
type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * @description 增强的ChatModel, 拦截invoke方法, 添加熔断器、限流器、指数退避重试、请求队列,实现模型服务的高可用
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
	//langchain内部需要使用（从内部的ChatOpenAI里copy的）
	static lc_name() {
		return 'ChatOpenAI';
	}

	constructor(
		config: DeepPartial<HAModelClientOptions>,
		private circuitBreakerService: CircuitBreakerService,
		private retryService: RetryService,
		private requestQueueService: RequestQueueService,
		private rateLimiter: RateLimiterService
	) {
		this.model = config.model as BaseChatModel;
		this.circuitBreakerConfig = config.circuitBreakerConfig as any;
		this.rateLimiterConfig = config.rateLimiterConfig as any;
		this.retryConfig = config.retryConfig as any;

		this.circuitBreakerService = circuitBreakerService;
		this.retryService = retryService;
		this.requestQueueService = requestQueueService;
		this.rateLimiter = rateLimiter;
	}

	async invoke(input: BaseLanguageModelInput, options?: ChatOpenAICallOptions) {
		// 熔断器保护
		const modelWithBreaker = this.withBreaker(input, options);
		// 1. 首先通过限流控制
		await this.rateLimiter.acquire();
		// 2. 然后进入请求队列
		return await this.requestQueueService.enqueue<AIMessageChunk>(async () => {
			// 3. 添加退避重试策略
			return this.retryService.exponentialBackoff(() => modelWithBreaker.fire(input), {
				maxRetries: this.retryConfig.maxRetries,
				initialDelayMs: this.retryConfig.initialDelayMs,
				maxDelayMs: this.retryConfig.maxDelayMs,
				factor: this.retryConfig.factor,
				retryableErrors: this.retryConfig.retryableErrors
			});
		});
	}

	private withBreaker(input: BaseLanguageModelInput, options?: ChatOpenAICallOptions) {
		// 设置熔断器
		const breaker = this.circuitBreakerService.createBreaker(
			`${(this.model as any)?.model ?? '模型名称读取失败'}`,
			async input => this.model.invoke(input, options), //*在这里调用模型的invoke方法
			{
				failureThreshold: 40,
				resetTimeout: 20000
			}
		);
		breaker.fallback(() => {
			throw new HttpException(
				`${(this.model as any)?.model}服务暂时不可用`,
				HttpStatus.SERVICE_UNAVAILABLE
			);
		});
		return breaker;
	}
}

@Injectable()
export class HAModelClientService {
	constructor(
		private circuitBreakerService: CircuitBreakerService,
		private retryService: RetryService,
		private requestQueueService: RequestQueueService,
		private rateLimiter: RateLimiterService,
		private configService: ConfigService
	) {}
	createClient(
		config: DeepPartial<HAModelClientOptions>
		// = {
		// 	modelConfig: {
		// 		model: 'deepseek-reasoner',
		// 		configuration: {
		// 			apiKey: this.configService.get('API_KEY_DEEPSEEK'),
		// 			timeout: 6000,
		// 			baseURL: this.configService.get('BASE_URL_DEEPSEEK'),
		// 			maxRetries: 3
		// 		}
		// 	},
		// 	circuitBreakerConfig: {
		// 		failureThreshold: 40,
		// 		resetTimeout: 20000
		// 	},
		// 	rateLimiterConfig: {
		// 		maxRequestsPerMinute: 60
		// 	},
		// 	retryConfig: {
		// 		maxRetries: 4,
		// 		initialDelayMs: 1000,
		// 		maxDelayMs: 15000,
		// 		factor: 2,
		// 		retryableErrors: [
		// 			/429/, // 速率限制错误
		// 			/503/, // 服务不可用
		// 			/timeout/i, // 超时错误
		// 			/ECONNRESET/, // 连接重置
		// 			/ETIMEDOUT/ // 连接超时
		// 		]
		// 	}
		// }
	) {
		return new HAModelClient(
			config,
			this.circuitBreakerService,
			this.retryService,
			this.requestQueueService,
			this.rateLimiter
		);
	}
}
