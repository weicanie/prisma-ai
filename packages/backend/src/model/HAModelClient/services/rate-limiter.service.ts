import { Injectable, Logger } from '@nestjs/common';

/**
 * 互斥锁实现
 * 提供明确的acquire和release操作，支持公平性（FIFO队列）
 */
class TraditionalMutex {
	private locked = false;
	private queue: Array<{ resolve: () => void; reject: (error: Error) => void }> = [];
	private currentHolder: string | null = null;
	private readonly logger = new Logger(TraditionalMutex.name);

	/**
	 * 获取锁
	 * @param requester 请求者标识（用于调试）
	 * @param timeout 超时时间（毫秒），默认不超时
	 */
	async acquire(requester: string, timeout?: number): Promise<void> {
		if (!this.locked) {
			this.locked = true;
			this.currentHolder = requester;
			this.logger.debug(`锁被 ${requester} 获取`);
			return Promise.resolve();
		}

		return new Promise<void>((resolve, reject) => {
			const queueItem = { resolve, reject };

			// 设置超时
			let timeoutId: NodeJS.Timeout | undefined;
			if (timeout) {
				timeoutId = setTimeout(() => {
					// 从队列中移除
					const index = this.queue.findIndex(item => item === queueItem);
					if (index !== -1) {
						this.queue.splice(index, 1);
					}
					reject(new Error(`获取锁超时: ${timeout}ms`));
				}, timeout);
			}

			// 添加到等待队列
			this.queue.push({
				resolve: () => {
					if (timeoutId) clearTimeout(timeoutId);
					this.currentHolder = requester;
					this.logger.debug(`锁被 ${requester} 获取（从队列中）`);
					resolve();
				},
				reject: (error: Error) => {
					if (timeoutId) clearTimeout(timeoutId);
					reject(error);
				}
			});

			this.logger.debug(`${requester} 等待锁，当前队列长度: ${this.queue.length}`);
		});
	}

	/**
	 * 释放锁
	 * @param requester 请求者标识（用于验证）
	 */
	release(requester: string): void {
		if (!this.locked) {
			this.logger.warn(`${requester} 尝试释放未锁定的锁`);
			return;
		}

		if (this.currentHolder !== requester) {
			this.logger.warn(`${requester} 尝试释放不属于自己的锁，当前持有者: ${this.currentHolder}`);
			return;
		}

		this.logger.debug(`锁被 ${requester} 释放`);

		if (this.queue.length > 0) {
			// 按FIFO顺序唤醒下一个等待者
			const next = this.queue.shift()!;
			next.resolve();
		} else {
			this.locked = false;
			this.currentHolder = null;
		}
	}

	/**
	 * 检查锁是否被锁定
	 */
	isLocked(): boolean {
		return this.locked;
	}

	/**
	 * 获取当前持有者
	 */
	getCurrentHolder(): string | null {
		return this.currentHolder;
	}

	/**
	 * 获取等待队列长度
	 */
	getQueueLength(): number {
		return this.queue.length;
	}

	/**
	 * 强制重置锁状态（用于测试和错误恢复）
	 */
	forceReset(): void {
		this.locked = false;
		this.currentHolder = null;
		this.queue.forEach(item => item.reject(new Error('锁被强制重置')));
		this.queue = [];
	}
}

@Injectable()
export class RateLimiterService {
	private readonly logger = new Logger(RateLimiterService.name);
	private tokenBucket: number;
	private lastRefillTimestamp: number;
	private readonly maxTokens: number;
	private readonly refillRate: number; // 每秒补充的令牌数
	private readonly maxWaitTime: number; // 最大等待时间（毫秒）
	private isWaiting: boolean = false; // 防止重复等待

	// 使用传统互斥锁替换简易实现
	private readonly mutexes = new Map<string, TraditionalMutex>();

	constructor(maxRequestsPerMinute = 60, maxWaitTimeMs = 60 * 60 * 1000) {
		this.maxTokens = maxRequestsPerMinute;
		this.tokenBucket = this.maxTokens;
		this.refillRate = maxRequestsPerMinute / 60; // 转换为每秒
		this.maxWaitTime = maxWaitTimeMs;
		this.lastRefillTimestamp = Date.now();
	}

	/**
	 * 获取令牌，如果令牌不足则等待
	 * @param key 用于区分不同限流器的键值
	 * @param requester 请求者标识（用于调试）
	 * @param lockTimeout 获取锁的超时时间（毫秒）
	 * @returns Promise<boolean> 是否成功获取令牌
	 */
	async acquire(
		key: string = 'default',
		requester: string = 'unknown',
		lockTimeout?: number
	): Promise<boolean> {
		// 获取或创建对应key的互斥锁
		if (!this.mutexes.has(key)) {
			this.mutexes.set(key, new TraditionalMutex());
		}

		const mutex = this.mutexes.get(key)!;

		try {
			// 获取锁
			await mutex.acquire(requester, lockTimeout);

			// 在锁保护下执行令牌获取逻辑
			return await this.acquireToken(requester);
		} finally {
			// 确保锁被释放
			mutex.release(requester);
		}
	}

	/**
	 * 实际获取令牌的逻辑（在锁保护下执行）
	 */
	private async acquireToken(requester: string): Promise<boolean> {
		// 先尝试补充令牌
		this.refill();

		// 如果有可用令牌，直接返回
		if (this.tokenBucket >= 1) {
			this.tokenBucket -= 1;
			this.logger.debug(`[${requester}] 获取令牌成功，剩余令牌: ${this.tokenBucket}`);
			return true;
		}

		// 如果没有可用令牌且已经在等待，直接拒绝（在互斥锁机制下不应该发生）
		if (this.isWaiting) {
			this.logger.warn(`[${requester}] 速率限制触发，已有请求在等待中`);
			return false;
		}

		// 计算需要等待的时间
		const tokensNeeded = 1;
		const waitTime = Math.ceil((tokensNeeded / this.refillRate) * 1000);

		// 如果等待时间超过最大限制，直接拒绝
		if (waitTime > this.maxWaitTime) {
			this.logger.warn(
				`[${requester}] 等待时间 ${waitTime}ms 超过最大限制 ${this.maxWaitTime}ms，拒绝请求`
			);
			return false;
		}

		this.logger.warn(`[${requester}] 速率限制触发，等待 ${waitTime}ms 获取令牌`);
		this.isWaiting = true;

		try {
			// 等待令牌补充
			await this.waitForToken(waitTime);
			this.isWaiting = false;

			// 再次尝试获取令牌
			this.refill();
			if (this.tokenBucket >= 1) {
				this.tokenBucket -= 1;
				this.logger.debug(`[${requester}] 等待后获取令牌成功，剩余令牌: ${this.tokenBucket}`);
				return true;
			} else {
				this.logger.warn(`[${requester}] 等待后仍无可用令牌`);
				return false;
			}
		} catch (error) {
			this.isWaiting = false;
			this.logger.error(`[${requester}] 等待令牌时发生错误: ${error.message}`);
			return false;
		}
	}

	/**
	 * 等待令牌补充
	 */
	private async waitForToken(waitTime: number): Promise<void> {
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				resolve();
			}, waitTime);

			// 添加错误处理
			process.on('unhandledRejection', () => {
				clearTimeout(timeout);
				reject(new Error('等待令牌时被中断'));
			});
		});
	}

	/**
	 * 补充令牌桶
	 */
	private refill(): void {
		const now = Date.now();
		const elapsedMs = now - this.lastRefillTimestamp;

		if (elapsedMs <= 0) return;

		// 使用更精确的计算方式
		const tokensToAdd = (elapsedMs / 1000) * this.refillRate;

		if (tokensToAdd > 0) {
			this.tokenBucket = Math.min(this.maxTokens, this.tokenBucket + tokensToAdd);
			this.lastRefillTimestamp = now;

			this.logger.debug(
				`补充令牌: +${tokensToAdd.toFixed(3)}, 当前令牌: ${this.tokenBucket.toFixed(3)}`
			);
		}
	}

	/**
	 * 获取当前令牌桶状态
	 */
	getStatus(): { tokens: number; maxTokens: number; refillRate: number } {
		return {
			tokens: this.tokenBucket,
			maxTokens: this.maxTokens,
			refillRate: this.refillRate
		};
	}

	/**
	 * 重置令牌桶
	 */
	reset(): void {
		this.tokenBucket = this.maxTokens;
		this.lastRefillTimestamp = Date.now();
		this.isWaiting = false;
		this.logger.debug('令牌桶已重置');
	}

	/**
	 * 获取指定key的锁状态信息
	 */
	getLockStatus(key: string = 'default'): {
		isLocked: boolean;
		currentHolder: string | null;
		queueLength: number;
	} | null {
		const mutex = this.mutexes.get(key);
		if (!mutex) return null;

		return {
			isLocked: mutex.isLocked(),
			currentHolder: mutex.getCurrentHolder(),
			queueLength: mutex.getQueueLength()
		};
	}

	/**
	 * 获取所有锁的状态信息
	 */
	getAllLocksStatus(): Record<
		string,
		{
			isLocked: boolean;
			currentHolder: string | null;
			queueLength: number;
		}
	> {
		const status: Record<string, any> = {};
		for (const [key, mutex] of this.mutexes.entries()) {
			status[key] = {
				isLocked: mutex.isLocked(),
				currentHolder: mutex.getCurrentHolder(),
				queueLength: mutex.getQueueLength()
			};
		}
		return status;
	}

	/**
	 * 强制重置指定key的锁（用于测试和错误恢复）
	 */
	forceResetLock(key: string): void {
		const mutex = this.mutexes.get(key);
		if (mutex) {
			mutex.forceReset();
			this.logger.warn(`锁 ${key} 已被强制重置`);
		}
	}

	/**
	 * 强制重置所有锁（用于测试和错误恢复）
	 */
	forceResetAllLocks(): void {
		for (const [key, mutex] of this.mutexes.entries()) {
			mutex.forceReset();
		}
		this.logger.warn('所有锁已被强制重置');
	}

	/**
	 * 清理指定key的锁（当不再需要时）
	 */
	cleanupLock(key: string): void {
		const mutex = this.mutexes.get(key);
		if (mutex && !mutex.isLocked() && mutex.getQueueLength() === 0) {
			this.mutexes.delete(key);
			this.logger.debug(`锁 ${key} 已被清理`);
		}
	}

	/**
	 * 清理所有空闲的锁
	 */
	cleanupIdleLocks(): void {
		for (const [key, mutex] of this.mutexes.entries()) {
			if (!mutex.isLocked() && mutex.getQueueLength() === 0) {
				this.mutexes.delete(key);
				this.logger.debug(`锁 ${key} 已被清理`);
			}
		}
	}
}
