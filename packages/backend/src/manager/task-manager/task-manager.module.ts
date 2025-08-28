import { Module } from '@nestjs/common';
import { TaskQueueModule } from '../../task-queue/task-queue.module';
import { TaskManagerService } from './task-manager.service';

@Module({
	imports: [TaskQueueModule],
	providers: [TaskManagerService],
	exports: [TaskManagerService]
})
export class TaskManagerModule {}
