import { Module } from '@nestjs/common';
import { ModelModule } from '../model/model.module';
import { MCPClientService } from './mcp-client.service';
import { AIToolService } from './tool.service';

@Module({
	providers: [AIToolService, MCPClientService],
	imports: [ModelModule],
	exports: [AIToolService, MCPClientService]
})
export class ClientModule {}
