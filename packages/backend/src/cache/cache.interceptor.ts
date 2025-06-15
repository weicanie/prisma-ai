import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as crypto from 'crypto';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheStrategyEnum } from '../cache.decorator';
import { RedisService } from '../redis/redis.service';

interface ETagCacheData {
  etag: string;
  data: any;
  timestamp: number;
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly ETAG_CACHE_PREFIX = 'etag:cache:';
  private readonly DEFAULT_CACHE_TTL = 3600; // 1小时默认缓存时间

  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const strategy: CacheStrategyEnum = this.reflector.getAllAndOverride(
      'cache-strategy-type',
      [context.getClass(), context.getHandler()],
    );

    if (!strategy) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    response.setHeader('Cache-Control', strategy);

    if (strategy === CacheStrategyEnum.NO_CACHE) {
      return next.handle();
    }

    // 生成缓存键，基于请求的唯一标识
    const cacheKey = this.generateCacheKey(request);
    const ifNoneMatch = request.headers['if-none-match'];

    try {
      // 从 Redis 获取缓存的 ETag 数据
      const cachedDataStr = await this.redisService.get(cacheKey);

      if (cachedDataStr) {
        const cachedData: ETagCacheData = JSON.parse(cachedDataStr);

        // 设置 ETag 头
        response.setHeader('ETag', cachedData.etag);

        // 检查客户端的 If-None-Match 头
        if (ifNoneMatch && ifNoneMatch === cachedData.etag) {
          response.status(304).send();
          return of(null);
        }

        // 如果缓存未过期且没有 If-None-Match 或不匹配，返回缓存的数据
        return of(cachedData.data);
      }
    } catch (error) {
      console.error('Redis 缓存读取失败:', error);
      // 继续正常流程
    }

    // 没有缓存或缓存失效，执行原始请求
    return next.handle().pipe(
      tap(async (data) => {
        try {
          // 生成新的 ETag
          const etag = `W/"${crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')}"`;
          response.setHeader('ETag', etag);

          // 将数据和 ETag 存储到 Redis
          const cacheData: ETagCacheData = {
            etag,
            data,
            timestamp: Date.now(),
          };

          // 根据缓存策略确定 TTL
          const ttl = this.getTTLFromStrategy(strategy);
          await this.redisService.set(cacheKey, JSON.stringify(cacheData), ttl);
        } catch (error) {
          console.error('Redis 缓存写入失败:', error);
          // 即使缓存失败，也要设置 ETag
          const etag = `W/"${crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')}"`;
          response.setHeader('ETag', etag);
        }
      }),
    );
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(request: any): string {
    const url = request.url;
    const method = request.method;
    const userId = request.user?.id || 'anonymous';
    const queryString = JSON.stringify(request.query || {});
    const bodyString = JSON.stringify(request.body || {});

    const keyData = `${method}:${url}:${userId}:${queryString}:${bodyString}`;
    const hash = crypto.createHash('md5').update(keyData).digest('hex');

    return `${this.ETAG_CACHE_PREFIX}${hash}`;
  }

  /**
   * 根据缓存策略获取 TTL
   */
  private getTTLFromStrategy(strategy: CacheStrategyEnum): number {
    // 从 Cache-Control 字符串中提取 max-age 值
    const maxAgeMatch = strategy.match(/max-age=(\d+)/);
    if (maxAgeMatch) {
      return parseInt(maxAgeMatch[1], 10);
    }
    return this.DEFAULT_CACHE_TTL;
  }
}
