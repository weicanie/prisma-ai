import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AichatModule } from './business/aichat/aichat.module';
import { CareerModule } from './business/career/career.module';
import { EducationModule } from './business/education/education.module';
import { HjmModule } from './business/human-job-match/hjm.module';
import { JobModule } from './business/job/job.module';
import { KnowledgebaseModule } from './business/knowledge-base/knowledge-base.module';
import { PrismaAgentModule } from './business/prisma-agent/prisma-agent.module';
import { ProjectModule } from './business/project/project.module';
import { QuestionModule } from './business/question/question.module';
import { ResumeModule } from './business/resume/resume.module';
import { SkillModule } from './business/skill/skill.module';
import { UserMemoryModule } from './business/user-memory/user-memory.module';
import { UserModule } from './business/user/user.module';
import { CacheModule } from './cache/cache.module';
import { ChainModule } from './chain/chain.module';
import { CopilotModule } from './copilot/copilot.module';
import { GlobalInterceptor } from './dataFormat.interceptor';
import { DbModule } from './DB/db.module';
import { GlobalFilter } from './errorHandle.filter';
import { EventBusModule } from './EventBus/event-bus.module';
import { IsLoginGuard } from './isLogin.guard';
import { SseSessionManagerModule } from './manager/sse-session-manager/sse-session-manager.module';
import { TaskManagerModule } from './manager/task-manager/task-manager.module';
@Module({
	imports: [
		UserModule,
		DbModule,
		ProjectModule,
		ChainModule,
		AichatModule,
		CacheModule,
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: [
				//本地开发时不传入环境变量NODE_ENV即可
				'.env',
				process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
			]
		}),
		/* mongodb数据库 */
		MongooseModule.forRoot(
			`mongodb://${process.env.MONGO_HOST ?? 'localhost'}:${process.env.MONGO_PORT ?? '27017'}/prisma-ai`
		),
		EventBusModule,
		SkillModule,
		ResumeModule,
		JobModule,
		CopilotModule,
		KnowledgebaseModule,
		HjmModule,
		PrismaAgentModule,
		QuestionModule,
		SseSessionManagerModule,
		TaskManagerModule,
		EducationModule,
		CareerModule,
		UserMemoryModule
	],
	providers: [
		{
			provide: APP_FILTER,
			useClass: GlobalFilter
		},
		{
			provide: APP_GUARD,
			useClass: IsLoginGuard
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: GlobalInterceptor
		}
	]
})
export class AppModule {}
