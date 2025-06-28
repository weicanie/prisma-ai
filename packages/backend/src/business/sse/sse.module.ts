import { Module } from '@nestjs/common';
import { EventBusModule } from '../../EventBus/event-bus.module';
import { ModelModule } from '../../model/model.module';
import { RedisModule } from '../../redis/redis.module';
import { LLMSessionPoolController } from '../../session/llm-sse-session-pool.controller';
import { SessionPoolModule } from '../../session/session-pool.module';
import { TaskQueueModule } from '../../task-queue/task-queue.module';
import { VectorStoreModule } from '../../vector-store/vector-store.module';
import { LLMSseService } from './llm-sse.service';
import { LLMCacheService } from './LLMCache.service';
@Module({
	controllers: [LLMSessionPoolController],
	providers: [LLMCacheService, LLMSseService],
	imports: [
		RedisModule,
		ModelModule,
		SessionPoolModule,
		TaskQueueModule,
		EventBusModule,
		VectorStoreModule
	],
	exports: [LLMSseService]
})
export class SseModule {}
