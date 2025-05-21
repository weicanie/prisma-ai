import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
	@Inject('REDIS_CLIENT')
	private redisClient: RedisClientType;

	async get(key: string) {
		return await this.redisClient.get(key);
	}

	async set(key: string, value: string | number, ttl?: number) {
		await this.redisClient.set(key, value);

		if (ttl) {
			await this.redisClient.expire(key, ttl);
		}
	}

	async del(key: string): Promise<number> {
		return await this.redisClient.del(key);
	}

	// 使用前缀获取多个键
	async getKeysByPattern(pattern: string): Promise<string[]> {
		return await this.redisClient.keys(pattern);
	}

	// 获取TTL
	async ttl(key: string): Promise<number> {
		return await this.redisClient.ttl(key);
	}
	//获取前缀匹配的所有key
	async keys(pattern: string): Promise<string[]> {
		return await this.redisClient.keys(pattern);
	}

	getClient(): RedisClientType {
		return this.redisClient;
	}
}
