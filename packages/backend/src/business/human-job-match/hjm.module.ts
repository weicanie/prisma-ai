import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { ChainModule } from '../../chain/chain.module';
import { TaskQueueModule } from '../../task-queue/task-queue.module';
import { VectorStoreModule } from '../../vector-store/vector-store.module';
import { Job, JobSchema } from '../job/entities/job.entity';
import { JobModule } from '../job/job.module';
import { ResumeModule } from '../resume/resume.module';
import { HjmController } from './hjm.controller';
import { HjmService } from './hjm.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    VectorStoreModule,
    JobModule,
    ResumeModule,
    ChainModule,
    TaskQueueModule,
  ],
  controllers: [HjmController],
  providers: [HjmService],
})
export class HjmModule {}
