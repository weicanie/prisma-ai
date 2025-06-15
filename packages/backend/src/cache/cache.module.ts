import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { CacheExampleController } from './cache-example.controller';
import { CacheInterceptor } from './cache.interceptor';

@Module({
  imports: [RedisModule],
  controllers: [CacheExampleController],
  providers: [CacheInterceptor],
  exports: [CacheInterceptor],
})
export class CacheModule {}
