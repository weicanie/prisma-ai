import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService, EventList } from '../EventBus/event-bus.service';
import { RedisService } from '../redis/redis.service';
//! 有缓存雪崩风险
export enum L1_DEFAULT_TTL {
	SHORT = 30, // 30秒 - 超热点数据
	MEDIUM = 300, // 5分钟 - 热点数据
	LONG = 1800 // 30分钟 - 一般数据
}
export enum L2_DEFAULT_TTL {
	SHORT = 1800, // 30分钟
	MEDIUM = 3600, // 1小时
	LONG = 86400 // 24小时
}

/**
 * 定义缓存键的前缀，用于分类和管理
 */
enum CacheKeyPrefix {
	project_retrieved_doc = 'project_retrieved_doc:',
	project_retrieved_code = 'project_retrieved_code:'
}

/**
 * 内存-redis-数据源的三级缓存服务
 */
@Injectable()
export class CacheService implements OnModuleInit {
	// L1 本地内存缓存
	private readonly localCache = new Map<string, any>();
	// 用于存储 L1 缓存的过期计时器
	private readonly localCacheTimeouts = new Map<string, NodeJS.Timeout>();

	private readonly logger = new Logger(CacheService.name);

	constructor(
		private readonly redisService: RedisService,
		private readonly eventBusService: EventBusService
	) {}

	async onModuleInit() {
		this.eventBusService.on(
			EventList.cacheProjectRetrievedDocAndCodeInvalidate,
			this.invalidateProjectRetrievedDocAndCode.bind(this)
		);
	}

	/**
	 * 从缓存中获取数据，会依次尝试 L1 -> L2
	 * @param key 缓存键
	 * @returns 缓存数据
	 */
	async get<T>(key: string): Promise<T | null> {
		// 1. 尝试从 L1 本地内存缓存获取
		if (this.localCache.has(key)) {
			this.logger.debug(`[Cache] L1 Hit: ${key}`);
			return this.localCache.get(key);
		}

		// 2. 尝试从 L2 Redis 缓存获取
		const redisValue = await this.redisService.get(key);
		if (redisValue) {
			this.logger.debug(`[Cache] L2 Hit: ${key}`);
			const value = JSON.parse(redisValue);
			// 将 L2 的数据同步到 L1，并设置较短的过期时间
			await this.setToL1(key, value, L1_DEFAULT_TTL.MEDIUM);
			return value;
		}

		this.logger.debug(`[Cache] Miss: ${key}`);
		return null;
	}

	/**
	 * 将数据设置到缓存 (L1 和 L2)
	 * @param key 缓存键
	 * @param value 缓存值
	 * @param ttl L2 (Redis) 过期时间 (秒)
	 * @param l1Ttl L1 (本地内存) 过期时间 (秒)，如果不提供则使用 ttl 或默认值
	 */
	async set<T>(key: string, value: T, ttl?: number, l1Ttl?: number): Promise<void> {
		this.logger.debug(`[Cache] Set: ${key}`);

		const jsonValue = JSON.stringify(value);
		// 1. 设置到 L2 Redis 缓存
		const effectiveTtl = ttl ?? L2_DEFAULT_TTL.MEDIUM;
		await this.redisService.set(key, jsonValue, effectiveTtl);

		// 2. 设置到 L1 本地内存缓存
		this.localCache.set(key, value);
		// 优先使用 l1Ttl，其次使用默认值
		const effectiveL1Ttl = l1Ttl ?? L1_DEFAULT_TTL.MEDIUM;
		await this.setToL1(key, value, effectiveL1Ttl);
	}

	private async setToL1<T>(key: string, value: T, ttl: number) {
		this.localCache.set(key, value);
		// 清除可能存在的旧的缓存过期计时器
		if (this.localCacheTimeouts.has(key)) {
			clearTimeout(this.localCacheTimeouts.get(key));
			this.localCacheTimeouts.delete(key);
		}
		// 设置新的过期计时器
		if (ttl > 0) {
			const timeout = setTimeout(() => {
				this.logger.debug(`[Cache] L1 Expire: ${key} (TTL: ${ttl}s)`);
				this.localCache.delete(key);
				this.localCacheTimeouts.delete(key); // 从计时器映射中移除
			}, ttl * 1000);
			this.localCacheTimeouts.set(key, timeout);
		}
	}

	/**
	 * 从缓存中删除数据 (L1 和 L2)
	 * @param key 缓存键
	 */
	async del(key: string): Promise<void> {
		this.logger.debug(`[Cache] Del: ${key}`);
		// 1. 从 L2 Redis 缓存删除
		try {
			await this.redisService.del(key);
		} catch (error) {
			this.logger.error(`[Cache] Del: ${key} failed`, error);
		}

		// 2. 从 L1 本地内存缓存删除
		this.localCache.delete(key);

		// 3. 清除 L1 缓存的过期计时器
		if (this.localCacheTimeouts.has(key)) {
			clearTimeout(this.localCacheTimeouts.get(key));
			this.localCacheTimeouts.delete(key);
		}
	}

	/**
	 * 尝试从缓存获取数据，如果不存在则从数据源函数获取，并存入缓存
	 * @param key 缓存键
	 * @param fn 从数据源获取数据的函数
	 * @param ttl 过期时间 (秒)
	 * @returns 数据
	 */
	async getOrSet<T>(key: string, fn: () => Promise<T>, ttl?: number, l1Ttl?: number): Promise<T> {
		const cachedData = await this.get<T>(key);
		if (cachedData) {
			return cachedData;
		}

		const dbData = await fn();
		if (dbData) {
			await this.set(key, dbData, ttl, l1Ttl);
		}
		return dbData;
	}

	getProjectRetrievedDocKey(projectName: string, userId: string) {
		return `${CacheKeyPrefix.project_retrieved_doc}${userId}:${projectName}`;
	}
	getProjectRetrievedCodeKey(projectName: string, userId: string) {
		return `${CacheKeyPrefix.project_retrieved_code}${userId}:${projectName}`;
	}

	/**
	 * 失效项目检索到的文档和代码的缓存
	 * @param projectId 项目id
	 */
	async invalidateProjectRetrievedDocAndCode({
		projectName,
		userId
	}: {
		projectName: string;
		userId: string;
	}) {
		await this.del(this.getProjectRetrievedDocKey(projectName, userId));
		await this.del(this.getProjectRetrievedCodeKey(projectName, userId));
	}
}
