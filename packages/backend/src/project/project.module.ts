import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as bodyParser from 'body-parser';
import { ChainModule } from '../chain/chain.module';
import { LookupResult, LookupResultSchema } from './entities/lookupResult.entity';
import { Project, ProjectSchema } from './entities/project.entity';
import { ProjectMined, ProjectMinedSchema } from './entities/projectMined.entity';
import { ProjectPolished, ProjectPolishedSchema } from './entities/projectPolished.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
@Module({
	controllers: [ProjectController],
	providers: [ProjectService],
	exports: [ProjectService],
	//Schema 注入模块作为 Model,然后实例化以操控mongodb数据库
	imports: [
		ChainModule,
		MongooseModule.forFeature([
			{ name: Project.name, schema: ProjectSchema },
			{ name: ProjectPolished.name, schema: ProjectPolishedSchema },
			{ name: ProjectMined.name, schema: ProjectMinedSchema },
			{ name: LookupResult.name, schema: LookupResultSchema }
		])
	] //forFeature指定模块可用的集合（表）
})
export class ProjectModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(bodyParser.text({ type: 'text/plain' })).forRoutes('project');
	}
}
