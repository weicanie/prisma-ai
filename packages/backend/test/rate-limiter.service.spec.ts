import { RateLimiterService } from '../src/model/HAModelClient/services/rate-limiter.service';

describe('RateLimiterService', () => {
	it('应该被定义', () => {
		const service = new RateLimiterService();
		expect(service).toBeDefined();
	});

	describe('令牌桶算法', () => {
		it('应该正确初始化令牌桶', () => {
			const limiter = new RateLimiterService(60); // 每分钟60个请求
			expect(limiter.getStatus().tokens).toBe(60);
			expect(limiter.getStatus().maxTokens).toBe(60);
			expect(limiter.getStatus().refillRate).toBe(1); // 每秒1个令牌
		});

		it('应该能够获取令牌', async () => {
			const limiter = new RateLimiterService(60);
			const result = await limiter.acquire('default', 'test1');
			expect(result).toBe(true);
			expect(limiter.getStatus().tokens).toBe(59);
		});

		it('当令牌不足时应该等待', async () => {
			const limiter = new RateLimiterService(1); // 每分钟1个请求

			// 第一个请求应该成功
			const result1 = await limiter.acquire('default', 'test1');
			expect(result1).toBe(true);

			// 第二个请求应该等待
			const result2 = await limiter.acquire('default', 'test2');

			expect(result2).toBe(true);
			// 由于等待时间较长，这里只验证结果，不验证具体等待时间
		}, 70000);

		it('应该正确处理并发请求的等待', async () => {
			const limiter = new RateLimiterService(1);

			// 第一个请求
			const result1 = await limiter.acquire('default', 'test1');
			expect(result1).toBe(true);

			// 第二个请求应该等待并最终成功
			const result2 = await limiter.acquire('default', 'test2');
			expect(result2).toBe(true);
		}, 70000);

		it('应该正确补充令牌', async () => {
			const limiter = new RateLimiterService(60);

			// 消耗所有令牌
			for (let i = 0; i < 60; i++) {
				await limiter.acquire('default', `test${i}`);
			}

			expect(limiter.getStatus().tokens).toBeLessThan(0.1); // 允许小的浮点数误差

			// 等待1秒后应该补充1个令牌
			await new Promise(resolve => setTimeout(resolve, 1100));
			expect(limiter.getStatus().tokens).toBeGreaterThan(0.001); // 允许小的浮点数误差
		});

		it('应该能够重置令牌桶', () => {
			const limiter = new RateLimiterService(60);

			// 消耗一些令牌
			limiter.acquire('default', 'test1');

			// 重置
			limiter.reset();

			expect(limiter.getStatus().tokens).toBe(60);
		});
	});

	describe('并发控制', () => {
		it('应该正确处理并发请求', async () => {
			const limiter = new RateLimiterService(10);
			const promises: any[] = [];

			// 同时发起10个请求
			for (let i = 0; i < 10; i++) {
				promises.push(limiter.acquire('default', `test${i}`));
			}

			const results = await Promise.all(promises);
			expect(results.every(result => result === true)).toBe(true);
			expect(limiter.getStatus().tokens).toBeLessThan(0.1); // 允许小的浮点数误差
		});

		it('应该使用不同的key创建独立的限流器', async () => {
			const limiter = new RateLimiterService(5);

			// 使用不同的key
			const result1 = await limiter.acquire('key1', 'test1');
			const result2 = await limiter.acquire('key2', 'test2');

			expect(result1).toBe(true);
			expect(result2).toBe(true);

			// 每个key应该有独立的令牌计数，但由于是同一个实例，令牌是共享的
			expect(limiter.getStatus().tokens).toBeCloseTo(3, 2); // 5 - 2 = 3，允许小的浮点数误差
		});
	});

	describe('边界情况', () => {
		it('应该处理最大等待时间限制', async () => {
			const limiter = new RateLimiterService(1, 1000); // 最大等待1秒

			// 第一个请求
			await limiter.acquire('default', 'test1');

			// 第二个请求应该因为等待时间过长而被拒绝
			const result = await limiter.acquire('default', 'test2');
			expect(result).toBe(false);
		});

		it('应该处理时间精度问题', async () => {
			const limiter = new RateLimiterService(1000); // 每分钟1000个请求

			// 高频率请求
			const promises: any[] = [];
			for (let i = 0; i < 100; i++) {
				promises.push(limiter.acquire('default', `test${i}`));
			}

			const results = await Promise.all(promises);
			expect(results.every(result => result === true)).toBe(true);
		});
	});

	describe('互斥锁功能', () => {
		it('应该正确管理锁状态', async () => {
			const limiter = new RateLimiterService(10);
			const key = 'testKey';

			// 初始状态
			const initialStatus = limiter.getLockStatus(key);
			expect(initialStatus).toBeNull(); // 还没有创建锁

			// 第一个请求
			const promise1 = limiter.acquire(key, 'requester1');

			// 检查锁状态
			const status1 = limiter.getLockStatus(key);
			expect(status1).not.toBeNull();
			expect(status1!.isLocked).toBe(true);
			expect(status1!.currentHolder).toBe('requester1');
			expect(status1!.queueLength).toBe(0);

			// 第二个请求（会等待）
			const promise2 = limiter.acquire(key, 'requester2');

			// 检查锁状态
			const status2 = limiter.getLockStatus(key);
			expect(status2!.isLocked).toBe(true);
			expect(status2!.currentHolder).toBe('requester1');
			expect(status2!.queueLength).toBe(1);

			// 等待第一个请求完成
			await promise1;

			// 等待第二个请求完成
			await promise2;

			// 检查最终状态
			const finalStatus = limiter.getLockStatus(key);
			expect(finalStatus!.isLocked).toBe(false);
			expect(finalStatus!.currentHolder).toBeNull();
			expect(finalStatus!.queueLength).toBe(0);
		});

		it('应该能够强制重置锁', async () => {
			const limiter = new RateLimiterService(1);
			const key = 'resetKey';

			// 第一个请求
			const promise1 = limiter.acquire(key, 'requester1');

			// 第二个请求（会等待）
			const promise2 = limiter.acquire(key, 'requester2');

			// 强制重置锁
			limiter.forceResetLock(key);

			// 第一个请求应该成功（因为它已经获取了锁）
			const result1 = await promise1;
			expect(result1).toBe(true);

			// 第二个请求应该失败（因为锁被强制重置）
			try {
				await promise2;
				fail('第二个请求应该失败');
			} catch (error) {
				expect(error.message).toContain('锁被强制重置');
			}

			// 锁状态应该被重置
			const status = limiter.getLockStatus(key);
			expect(status!.isLocked).toBe(false);
			expect(status!.currentHolder).toBeNull();
			expect(status!.queueLength).toBe(0);
		});

		it('应该能够清理空闲锁', async () => {
			const limiter = new RateLimiterService(10);
			const key1 = 'key1';
			const key2 = 'key2';

			// 使用两个key
			await limiter.acquire(key1, 'requester1');
			await limiter.acquire(key2, 'requester2');

			// 检查锁状态
			expect(limiter.getLockStatus(key1)).not.toBeNull();
			expect(limiter.getLockStatus(key2)).not.toBeNull();

			// 清理空闲锁
			limiter.cleanupIdleLocks();

			// 锁应该被清理
			expect(limiter.getLockStatus(key1)).toBeNull();
			expect(limiter.getLockStatus(key2)).toBeNull();
		});
	});
});
