import { Module } from '@nestjs/common';
import { EventBusModule } from '../../EventBus/event-bus.module';
import { RedisModule } from '../../redis/redis.module';
import { TaskQueueModule } from '../../task-queue/task-queue.module';
import { TaskManagerModule } from '../task-manager/task-manager.module';
import { SseSessionManagerService } from './session-manager.service';
import { SseManagerService } from './sse-manager.service';
import { SseSessionManagerController } from './sse-session-manager.controller';

@Module({
	imports: [RedisModule, TaskQueueModule, TaskManagerModule, EventBusModule],
	controllers: [SseSessionManagerController],
	providers: [SseSessionManagerService, SseManagerService],
	exports: [SseSessionManagerService, SseManagerService]
})
export class SseSessionManagerModule {}
