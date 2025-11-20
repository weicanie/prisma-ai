import { Module } from '@nestjs/common';
import { EventBusModule } from '../../EventBus/event-bus.module';
import { RedisModule } from '../../redis/redis.module';
import { TaskQueueModule } from '../../task-queue/task-queue.module';
import { SseSessionManagerService } from './session-manager.service';
import { SseManagerService } from './sse-manager.service';
import { SseSessionManagerController } from './sse-session-manager.controller';

@Module({
	imports: [RedisModule, TaskQueueModule, EventBusModule],
	controllers: [SseSessionManagerController],
	providers: [
		SseSessionManagerService,
		SseManagerService,
		{
			provide: 'SsePipeManager',
			useExisting: SseManagerService
		},
		{
			provide: 'SseSessionManager',
			useExisting: SseSessionManagerService
		}
	],
	exports: ['SseSessionManager', 'SsePipeManager']
})
export class SseSessionManagerModule {}
