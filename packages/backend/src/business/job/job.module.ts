import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChainModule } from '../../chain/chain.module';
import { TaskQueueModule } from '../../task-queue/task-queue.module';
import { CrawlJobService } from './crawl-job.service';
import { Job, JobSchema } from './entities/job.entity';
import { JobController } from './job.controller';
import { JobService } from './job.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    forwardRef(() => TaskQueueModule),
    ChainModule,
  ],
  controllers: [JobController],
  providers: [JobService, CrawlJobService],
  exports: [JobService],
})
export class JobModule {}
