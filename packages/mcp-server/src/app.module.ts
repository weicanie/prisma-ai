import { Module } from '@nestjs/common';
import { McpServerModule } from './mcp/mcp-server.module';
import { McpController } from './mcp/mcp.controller';

@Module({
  imports: [McpServerModule],
  controllers: [McpController],
})
export class AppModule {}
