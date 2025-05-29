import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ChainModule } from './chain/chain.module';
import { DbModule } from './DB/db.module';
import { GlobalFilter } from './errorHandle.filter';
import { EventBusModule } from './EventBus/event-bus.module';
import { GraphModule } from './graph/graph.module';
import { JobModule } from './job/job.module';
import { ProjectModule } from './project/project.module';
import { ResumeModule } from './resume/resume.module';
import { SessionPoolModule } from './session/session-pool.module';
import { SkillModule } from './skill/skill.module';
import { SseModule } from './sse/sse.module';
import { UserModule } from './user/user.module';

@Module({
	imports: [
		UserModule,
		DbModule,
		ProjectModule,
		ChainModule,
		GraphModule,
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: [
				'.env',
				process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
			]
		}),
		/* mongodb数据库 */
		MongooseModule.forRoot('mongodb://localhost:27017/prisma-ai'),
		SseModule,
		SessionPoolModule,
		EventBusModule,
		SkillModule,
		ResumeModule,
		JobModule
	],
	providers: [
		{
			provide: 'APP_EXCEPTION_FILTER',
			useClass: GlobalFilter
		}
		// {
		// 	provide: 'APP_GUARD',
		// 	useClass: IsLoginGuard
		// }
	]
})
export class AppModule {}
