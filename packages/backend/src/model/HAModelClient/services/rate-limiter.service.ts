import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private tokenBucket: number;
  private lastRefillTimestamp: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // 每秒补充的令牌数

  constructor(maxRequestsPerMinute = 60) {
    this.maxTokens = maxRequestsPerMinute;
    this.refillRate = maxRequestsPerMinute / 60; // 转换为每秒
    this.tokenBucket = this.maxTokens;
    this.lastRefillTimestamp = Date.now();
  }

  async acquire(): Promise<boolean> {
    this.refill();

    if (this.tokenBucket >= 1) {
      this.tokenBucket -= 1;
      return true;
    } else {
      const waitTime = Math.ceil(1000 / this.refillRate); // 计算等待时间
      this.logger.warn(`速率限制触发，等待${waitTime}ms`);

      // 等待一段时间后再次尝试
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return this.acquire(); // 递归调用直到获取到令牌
    }
  }

  private refill() {
    const now = Date.now();
    const elapsedMs = now - this.lastRefillTimestamp;
    const tokensToAdd = elapsedMs * (this.refillRate / 1000);

    if (tokensToAdd > 0) {
      this.tokenBucket = Math.min(
        this.maxTokens,
        this.tokenBucket + tokensToAdd,
      );
      this.lastRefillTimestamp = now;
    }
  }
}
