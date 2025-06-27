import { forwardRef, Module } from '@nestjs/common';
import { ChainModule } from '../../chain/chain.module';
import { OssModule } from '../../oss/oss.module';
import { TaskQueueModule } from '../../task-queue/task-queue.module';
import { HjmModule } from '../human-job-match/hjm.module';
import { JobModule } from '../job/job.module';
import { ProjectModule } from '../project/project.module';
import { ResumeModule } from '../resume/resume.module';
import { SkillModule } from '../skill/skill.module';
import { AutoflowService } from './autoflow.service';

@Module({
	controllers: [],
	providers: [AutoflowService],
	imports: [
		forwardRef(() => ProjectModule),
		forwardRef(() => JobModule),
		forwardRef(() => SkillModule),
		forwardRef(() => ResumeModule),
		forwardRef(() => HjmModule),
		OssModule,
		forwardRef(() => ChainModule),

		forwardRef(() => TaskQueueModule)
	]
})
export class AutoflowModule {}
