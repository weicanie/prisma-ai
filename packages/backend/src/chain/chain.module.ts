import { forwardRef, Module } from '@nestjs/common';
import { AgentModule } from '../agent/agent.module';
import { ClientModule } from '../mcp-client/mcp-client.module';
import { ModelModule } from '../model/model.module';
import { PrismaAgentModule } from '../prisma-agent/prisma-agent.module';
import { PromptModule } from '../prompt/prompt.module';
import { WithFormfixChain } from '../utils/abstract';
import { AichatChainService } from './aichat-chain.service';
import { ChainService } from './chain.service';
import { ProjectChainService } from './project-chain.service';

@Module({
	controllers: [],
	providers: [
		ChainService,
		AichatChainService,
		ProjectChainService,
		{
			provide: WithFormfixChain,
			useExisting: ChainService
		}
	],
	imports: [
		AgentModule,
		ModelModule,
		PromptModule,
		ClientModule,
		forwardRef(() => PrismaAgentModule)
	],
	exports: [ChainService, AichatChainService, ProjectChainService, WithFormfixChain]
})
export class ChainModule {}
