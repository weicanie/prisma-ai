import { Module } from '@nestjs/common';
import { AgentModule } from '../agent/agent.module';
import { ClientModule } from '../mcp-client/mcp-client.module';
import { ModelModule } from '../model/model.module';
import { PromptModule } from '../prompt/prompt.module';
import { ChainService } from './chain.service';

@Module({
	controllers: [],
	providers: [ChainService],
	imports: [AgentModule, ModelModule, PromptModule, ClientModule],
	exports: [ChainService, AgentModule, ModelModule, PromptModule]
})
export class ChainModule {}
