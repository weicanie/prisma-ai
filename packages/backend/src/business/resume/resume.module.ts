import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChainModule } from '../../chain/chain.module';
import { EventBusModule } from '../../EventBus/event-bus.module';
import { RedisModule } from '../../redis/redis.module';
import { Job, JobSchema } from '../job/entities/job.entity';
import { JobModule } from '../job/job.module';
import { Project, ProjectSchema } from '../project/entities/project.entity';
import { Skill, SkillSchema } from '../skill/entities/skill.entity';
import { SseModule } from '../sse/sse.module';
import { Resume, ResumeSchema } from './entities/resume.entity';
import { ResumeMatched, ResumeMatchedSchema } from './entities/resumeMatched.entity';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Resume.name, schema: ResumeSchema },
			{ name: Project.name, schema: ProjectSchema },
			{ name: Skill.name, schema: SkillSchema },
			{ name: ResumeMatched.name, schema: ResumeMatchedSchema },
			{ name: Job.name, schema: JobSchema }
		]),
		JobModule,
		ChainModule,
		EventBusModule,
		RedisModule,
		forwardRef(() => SseModule)
	],
	controllers: [ResumeController],
	providers: [
		ResumeService,
		{
			provide: 'WithFuncPoolResumeService',
			useExisting: ResumeService
		}
	],
	exports: [ResumeService, 'WithFuncPoolResumeService']
})
export class ResumeModule {}
