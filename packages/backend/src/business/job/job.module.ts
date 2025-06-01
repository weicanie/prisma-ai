import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrawlService } from './crawl.service';
import { Job, JobSchema } from './entities/job.entity';
import { JobController } from './job.controller';
import { JobService } from './job.service';

@Module({
	imports: [MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }])],
	controllers: [JobController],
	providers: [JobService, CrawlService],
	exports: [JobService]
})
export class JobModule {}
