import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LogInterceptor } from './interceptors/log.interceptor';
import { CLIService } from './services/cli.service';
import { LLMService } from './services/llm.service';
import { MCPClientService } from './services/mcp-client.service';
import { ToolService } from './services/tool.service';
import { defaultConfig } from './utils/config.util';

@Module({
	providers: [
		LLMService,
		ToolService,
		MCPClientService,
		CLIService,
		{
			provide: APP_INTERCEPTOR,
			useClass: LogInterceptor
		},
		{
			provide: 'MCP_CLIENT',
			useValue: new Client({
				name: defaultConfig.clientName,
				version: defaultConfig.clientVersion
			})
		}
	]
})
export class ClientModule {}
