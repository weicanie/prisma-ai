import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { CacheService } from './cache.service';

@Module({
	controllers: [],
	providers: [CacheService],
	imports: [RedisModule],
	exports: [CacheService]
})
export class CacheModule {}
