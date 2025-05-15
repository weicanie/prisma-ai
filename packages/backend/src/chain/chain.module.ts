import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentModule } from '../agent/agent.module';
import { ClientModule } from '../mcp-client/mcp-client.module';
import { ModelModule } from '../model/model.module';
import { PromptModule } from '../prompt/prompt.module';
import { ChainService } from './chain.service';
import { Project, ProjectSchema } from './entities/project.entities';

@Module({
	controllers: [],
	providers: [ChainService],
	imports: [
		AgentModule,
		ModelModule,
		PromptModule,
		ClientModule,
		MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }])
	],
	exports: [ChainService, AgentModule, ModelModule, PromptModule]
})
export class ChainModule {}
