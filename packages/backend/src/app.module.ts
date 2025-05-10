import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChainModule } from './chain/chain.module';
import { GraphModule } from './graph/graph.module';
import { GeneralResumeModule } from './project/project.module';

@Module({
	imports: [
		GeneralResumeModule,
		ChainModule,
		MongooseModule.forRoot('mongodb://localhost:27017/chainResume'),
		GraphModule //连接mongodb数据库
	]
})
export class AppModule {}
