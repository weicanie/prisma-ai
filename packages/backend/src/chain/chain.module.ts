import { forwardRef, Module } from '@nestjs/common';
import { AgentModule } from '../agent/agent.module';
import { PrismaAgentModule } from '../business/prisma-agent/prisma-agent.module';
import { UserMemoryModule } from '../business/user-memory/user-memory.module';
import { CacheModule } from '../cache/cache.module';
import { ClientModule } from '../mcp-client/mcp-client.module';
import { ModelModule } from '../model/model.module';
import { PromptModule } from '../prompt/prompt.module';
import { WithFormfixChain } from '../type/abstract';
import { AichatChainService } from './aichat-chain.service';
import { ChainService } from './chain.service';
import { HjmChainService } from './hjm-chain.service';
import { ProjectChainService } from './project-chain.service';
import { ProjectKonwbaseRetrieveService } from './project-konwbase-retrieve.service';

@Module({
	controllers: [],
	providers: [
		ChainService,
		AichatChainService,
		ProjectChainService,
		HjmChainService,
		{
			provide: WithFormfixChain,
			useExisting: ChainService
		},
		ProjectKonwbaseRetrieveService
	],
	imports: [
		AgentModule,
		ModelModule,
		PromptModule,
		ClientModule,
		CacheModule,
		forwardRef(() => UserMemoryModule),
		forwardRef(() => PrismaAgentModule)
	],
	exports: [
		ChainService,
		AichatChainService,
		ProjectChainService,
		WithFormfixChain,
		HjmChainService,
		ProjectKonwbaseRetrieveService
	]
})
export class ChainModule {}
