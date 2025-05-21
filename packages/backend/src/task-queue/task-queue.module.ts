import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { TaskQueueService } from './task-queue.service';

@Module({
	providers: [TaskQueueService],
	exports: [TaskQueueService],
	imports: [RedisModule]
})
export class TaskQueueModule {}
