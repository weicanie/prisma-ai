import { forwardRef, Module } from '@nestjs/common';
import { ProjectModule } from '../business/project/project.module';
import { ChainModule } from '../chain/chain.module';
import { EventBusModule } from '../EventBus/event-bus.module';
import { RedisModule } from '../redis/redis.module';
import { SessionPoolModule } from '../session/session-pool.module';
import { TaskQueueModule } from '../task-queue/task-queue.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { LLMCacheService } from './LLMCache.service';
import { SseController } from './sse.controller';
import { SseService } from './sse.service';
@Module({
	controllers: [SseController],
	providers: [SseService, LLMCacheService],
	imports: [
		ChainModule,
		forwardRef(() => ProjectModule),
		RedisModule,
		SessionPoolModule,
		TaskQueueModule,
		VectorStoreModule,
		forwardRef(() => EventBusModule)
	]
})
export class SseModule {}
