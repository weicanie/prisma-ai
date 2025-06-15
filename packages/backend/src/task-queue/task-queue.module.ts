import { forwardRef, Module } from '@nestjs/common';
import { EventBusModule } from '../EventBus/event-bus.module';
import { RedisModule } from '../redis/redis.module';
import { TaskQueueService } from './task-queue.service';

@Module({
  providers: [TaskQueueService],
  exports: [TaskQueueService],
  imports: [RedisModule, forwardRef(() => EventBusModule)],
})
export class TaskQueueModule {}
