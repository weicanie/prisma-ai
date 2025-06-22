import { Module } from '@nestjs/common';
import { AgentModule } from '../agent/agent.module';
import { ClientModule } from '../mcp-client/mcp-client.module';
import { ModelModule } from '../model/model.module';
import { PromptModule } from '../prompt/prompt.module';
import { AichatChainService } from './aichat-chain.service';
import { ChainService } from './chain.service';

@Module({
	controllers: [],
	providers: [ChainService, AichatChainService],
	imports: [AgentModule, ModelModule, PromptModule, ClientModule],
	exports: [ChainService, AichatChainService]
})
export class ChainModule {}
