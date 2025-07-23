import { Module } from '@nestjs/common';
import { ChainModule } from '../../chain/chain.module';
import { DbModule } from '../../DB/db.module';
import { EventBusModule } from '../../EventBus/event-bus.module';
import { PrismaAgentModule } from '../../prisma-agent/prisma-agent.module';
import { RedisModule } from '../../redis/redis.module';
import { TaskQueueModule } from '../../task-queue/task-queue.module';
import { SkillModule } from '../skill/skill.module';
import { InterviewSummaryController } from './interview-summary.controller';
import { InterviewSummaryService } from './interview-summary.service';

@Module({
	controllers: [InterviewSummaryController],
	providers: [InterviewSummaryService],
	exports: [InterviewSummaryService],
	imports: [
		DbModule,
		ChainModule,
		EventBusModule,
		RedisModule,
		TaskQueueModule,
		SkillModule,
		PrismaAgentModule
	]
})
export class InterviewSummaryModule {}
