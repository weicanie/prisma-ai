import { Module } from '@nestjs/common';
import { MCPClientService } from './mcp-client.service';

@Module({
  providers: [MCPClientService],
  imports: [],
  exports: [MCPClientService],
})
export class ClientModule {}
