/**
 * MCP Server Module
 * 创建模块以便在 NestJS 中集成 MCP 服务器
 */
import { Module } from '@nestjs/common';
import { McpServerService } from './mcp-server.service';

@Module({
	providers: [McpServerService],
	exports: [McpServerService]
})
export class McpServerModule {}
