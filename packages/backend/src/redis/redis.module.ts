import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { RedisService } from './redis.service';

@Global()
@Module({
	controllers: [],
	providers: [
		RedisService,
		{
			provide: 'RedisLike',
			useExisting: RedisService
		},
		{
			provide: 'REDIS_CLIENT',
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => {
				const client = createClient({
					socket: {
						host: configService.get('REDIS_HOST') ?? 'localhost',
						port: +(configService.get('REDIS_PORT') ?? 6379)
					},
					database: 0
				});
				const logger = new Logger();
				try {
					await client.connect();
					logger.log('redis数据库连接成功', 'RedisModule');
				} catch (error) {
					logger.error('redis数据库连接失败', error);
					throw error;
				}
				return client;
			}
		}
	],
	imports: [],
	exports: [RedisService, 'RedisLike']
})
export class RedisModule {}
