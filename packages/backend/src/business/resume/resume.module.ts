import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChainModule } from '../../chain/chain.module';
import { EventBusModule } from '../../EventBus/event-bus.module';
import { SseSessionManagerModule } from '../../manager/sse-session-manager/sse-session-manager.module';
import { TaskManagerModule } from '../../manager/task-manager/task-manager.module';
import { RedisModule } from '../../redis/redis.module';
import { CareerModule } from '../career/career.module';
import { EducationModule } from '../education/education.module';
import { Job, JobSchema } from '../job/entities/job.entity';
import { JobModule } from '../job/job.module';
import { Project, ProjectSchema } from '../project/entities/project.entity';
import { ProjectModule } from '../project/project.module';
import { Skill, SkillSchema } from '../skill/entities/skill.entity';
import { SkillModule } from '../skill/skill.module';
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
		TaskManagerModule,
		SseSessionManagerModule,
		CareerModule,
		EducationModule,
		SkillModule,
		ProjectModule
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
