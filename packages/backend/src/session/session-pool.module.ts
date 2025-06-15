import { forwardRef, Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { TaskQueueModule } from '../task-queue/task-queue.module';
import { LLMSessionPoolController } from './llm-sse-session-pool.controller';
import { LLMSseSessionPoolService } from './llm-sse-session-pool.service';

@Module({
  controllers: [LLMSessionPoolController],
  providers: [LLMSseSessionPoolService],
  imports: [RedisModule, forwardRef(() => TaskQueueModule)],
  exports: [LLMSseSessionPoolService],
})
export class SessionPoolModule {}
