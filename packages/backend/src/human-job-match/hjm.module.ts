import { Module } from '@nestjs/common';
import { JobModule } from '../business/job/job.module';
import { ResumeModule } from '../business/resume/resume.module';
import { ChainModule } from '../chain/chain.module';
import { TaskQueueModule } from '../task-queue/task-queue.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { HjmController } from './hjm.controller';
import { HjmService } from './hjm.service';

@Module({
	imports: [VectorStoreModule, JobModule, ResumeModule, ChainModule, TaskQueueModule],
	controllers: [HjmController],
	providers: [HjmService]
})
export class HjmModule {}
