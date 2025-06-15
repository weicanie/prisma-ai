import { SetMetadata } from '@nestjs/common';
// 缓存策略枚举
export enum CacheStrategyEnum {
  // 不缓存
  NO_CACHE = 'no-store, no-cache, must-revalidate, proxy-revalidate',
  // 私有缓存，短期（5分钟）
  PRIVATE_SHORT = 'private, max-age=300',
  // 私有缓存，中期（1小时）
  PRIVATE_MEDIUM = 'private, max-age=3600',
  // 私有缓存，长期（1天）
  PRIVATE_LONG = 'private, max-age=86400',
  // 公共缓存，短期（5分钟）
  PUBLIC_SHORT = 'public, max-age=300',
  // 公共缓存，中期（1小时）
  PUBLIC_MEDIUM = 'public, max-age=3600',
  // 公共缓存，长期（1天）
  PUBLIC_LONG = 'public, max-age=86400',
}

// 缓存策略装饰器
export const CacheStrategy = (strategy: CacheStrategyEnum) => {
  return SetMetadata('cache-strategy-type', strategy);
};
