import { Module } from '@nestjs/common';
import { ClientModule } from '../mcp-client/mcp-client.module';
import { ModelModule } from '../model/model.module';
import { AgentService } from './agent.service';

@Module({
	controllers: [],
	providers: [AgentService],
	imports: [ModelModule, ClientModule],
	exports: [AgentService]
})
export class AgentModule {}
