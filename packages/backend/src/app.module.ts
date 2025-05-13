import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ChainModule } from './chain/chain.module';
import { DbModule } from './DB/db.module';
import { GlobalFilter } from './global.filter';
import { GraphModule } from './graph/graph.module';
import { IsLoginGuard } from './isLogin.guard';
import { ProjectModule } from './project/project.module';
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
				process.env.NODE_ENVIRONMENT === 'production' ? '.env.production' : '.env.development',
				'.env'
			]
		}),
		MongooseModule.forRoot('mongodb://localhost:27017/chainResume') //连接mongodb数据库
	],
	providers: [
		{
			provide: 'APP_EXCEPTION_FILTER',
			useClass: GlobalFilter
		},
		{
			provide: 'APP_GUARD',
			useClass: IsLoginGuard
		}
	]
})
export class AppModule {}
