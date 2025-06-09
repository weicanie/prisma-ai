import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheStrategy, CacheStrategyEnum } from '../cache.decorator';
import { CacheInterceptor } from './cache.interceptor';

@Controller('cache-example')
@UseInterceptors(CacheInterceptor)
export class CacheExampleController {
	@Get('public-short')
	@CacheStrategy(CacheStrategyEnum.PUBLIC_SHORT) // 公共缓存，5分钟
	async getPublicShortCache() {
		// 模拟一些计算密集型操作
		await new Promise(resolve => setTimeout(resolve, 1000));

		return {
			message: '这是一个公共短期缓存的例子',
			timestamp: new Date().toISOString(),
			data: {
				randomValue: Math.random(),
				processedAt: Date.now()
			}
		};
	}

	@Get('private-medium')
	@CacheStrategy(CacheStrategyEnum.PRIVATE_MEDIUM) // 私有缓存，1小时
	async getPrivateMediumCache() {
		// 模拟数据库查询
		await new Promise(resolve => setTimeout(resolve, 500));

		return {
			message: '这是一个私有中期缓存的例子',
			timestamp: new Date().toISOString(),
			userSpecificData: {
				id: Math.floor(Math.random() * 1000),
				preferences: ['setting1', 'setting2'],
				lastAccess: Date.now()
			}
		};
	}

	@Get('public-long')
	@CacheStrategy(CacheStrategyEnum.PUBLIC_LONG) // 公共缓存，1天
	async getPublicLongCache() {
		return {
			message: '这是一个公共长期缓存的例子',
			timestamp: new Date().toISOString(),
			staticData: {
				version: '1.0.0',
				config: {
					maxItems: 100,
					features: ['feature1', 'feature2']
				}
			}
		};
	}

	@Get('no-cache')
	@CacheStrategy(CacheStrategyEnum.NO_CACHE) // 不缓存
	async getNoCacheData() {
		return {
			message: '这个数据不会被缓存',
			timestamp: new Date().toISOString(),
			realTimeData: {
				currentTime: Date.now(),
				randomValue: Math.random()
			}
		};
	}
}
