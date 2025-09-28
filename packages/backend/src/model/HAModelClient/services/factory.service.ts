import { Injectable } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';
import { RequestQueueService } from './request-queue.service';

@Injectable()
export class FactoryService {
	private readonly limiters = new Map<string, RateLimiterService>();
	private readonly queues = new Map<string, RequestQueueService>();

	/**
	 * 获取或创建限流器实例
	 * @param key 限流器的唯一标识
	 * @param maxRequestsPerMinute 每分钟最大请求数
	 * @param maxWaitTimeMs 最大等待时间（毫秒）
	 * @returns RateLimiterService 限流器实例
	 */
	getLimiter(
		key: string,
		maxRequestsPerMinute: number,
		maxWaitTimeMs: number = 60000
	): RateLimiterService {
		if (!this.limiters.has(key)) {
			this.limiters.set(key, new RateLimiterService(maxRequestsPerMinute, maxWaitTimeMs));
		}
		return this.limiters.get(key)!;
	}

	/**
	 * 移除指定的限流器实例
	 * @param key 限流器的唯一标识
	 */
	removeLimiter(key: string): void {
		this.limiters.delete(key);
	}

	/**
	 * 获取所有限流器的状态
	 */
	getAllLimitersStatus(): Record<string, any> {
		const status: Record<string, any> = {};
		for (const [key, limiter] of this.limiters.entries()) {
			status[key] = limiter.getStatus();
		}
		return status;
	}

	/**
	 * 重置所有限流器
	 */
	resetAllLimiters(): void {
		for (const limiter of this.limiters.values()) {
			limiter.reset();
		}
	}

	getQueue(key: string, maxConcurrent: number = 5): RequestQueueService {
		if (!this.queues.has(key)) {
			this.queues.set(key, new RequestQueueService(maxConcurrent));
		}
		return this.queues.get(key)!;
	}

	removeQueue(key: string): void {
		this.queues.delete(key);
	}
}
