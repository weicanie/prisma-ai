import { Module } from '@nestjs/common';
import { ChatHistoryService } from '../chat_history.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { HAModelClientService } from './services/HAModelClient.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { RequestQueueService } from './services/request-queue.service';
import { RetryService } from './services/retry.service';
@Module({
  controllers: [],
  providers: [
    HAModelClientService,
    ChatHistoryService,
    CircuitBreakerService, //熔断器
    RetryService, //指数退避重试
    //请求队列
    {
      provide: RequestQueueService,
      useFactory: () => new RequestQueueService(5), //最大并发为5
    },
    //限流
    {
      provide: RateLimiterService,
      useFactory: () => new RateLimiterService(60), //默认限制每分钟最多60次请求
    },
  ],
  exports: [HAModelClientService],
  imports: [],
})
export class HAModelClientModule {}
