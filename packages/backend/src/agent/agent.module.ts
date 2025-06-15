import { Module } from '@nestjs/common';
import { ClientModule } from '../mcp-client/mcp-client.module';
import { AgentService } from './agent.service';

@Module({
  controllers: [],
  providers: [AgentService],
  imports: [ClientModule],
  exports: [AgentService],
})
export class AgentModule {}
