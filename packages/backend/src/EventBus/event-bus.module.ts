import { forwardRef, Global, Module } from '@nestjs/common';
import { SseModule } from '../business/sse/sse.module';
import { TaskQueueModule } from '../task-queue/task-queue.module';
import { EventBusService } from './event-bus.service';

@Global()
@Module({
  controllers: [],
  providers: [EventBusService],
  exports: [EventBusService],
  imports: [forwardRef(() => SseModule), forwardRef(() => TaskQueueModule)],
})
export class EventBusModule {}
