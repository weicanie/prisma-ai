import { Client } from '@modelcontextprotocol/sdk/client/index.js'; //得手动引入,插件自动引入有问题
import { Injectable } from '@nestjs/common';
import { addLogs } from '../utils/log.utils';
import { logType, OpenAITool, ToolCallResult } from './mcp.type';
import { patchSchemaArrays } from './schemaPatch.util';

/**
 * getTools、callTool
 */
@Injectable()
export class AIToolService {
	/**
	 * 获取MCP服务器提供的工具列表,并统一转为OpenAITool格式
	 */
	async getTools(client: Client): Promise<OpenAITool[]> {
		try {
			const toolsResult = await client.listTools();

			addLogs(toolsResult, logType.GetTools);
			const openaiToolResult: OpenAITool[] = toolsResult.tools.map(tool => ({
				type: 'function' as const,
				function: {
					name: tool.name || '',
					description: tool.description || '',
					parameters: patchSchemaArrays(tool.inputSchema) || {}
				}
			}));
			addLogs({ origin: toolsResult, ToOpenai: openaiToolResult }, logType.GetTools);
			return openaiToolResult;
		} catch (error) {
			addLogs(error, logType.GetToolsError);
			throw new Error(
				`获取工具列表失败: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * 调用tool获取结果返回给llm,	其中content字段会被处理为统一格式
	 * @param toolName 工具名称
	 * @param toolArgs 工具参数
	 * @returns 工具调用结果
	 */
	async callTool(
		client: Client,
		toolName: string,
		toolArgs: Record<string, unknown>
		//FIXME mcpResult 不一定是 ToolCallResult
	): Promise<ToolCallResult> {
		try {
			addLogs(
				{
					name: toolName,
					arguments: toolArgs
				},
				logType.ToolCall
			);
			const mcpResult = await client.callTool({
				name: toolName,
				arguments: toolArgs
			});
			//处理其content字段
			const result: ToolCallResult = {
				content:
					typeof mcpResult.content === 'string'
						? mcpResult.content
						: JSON.stringify(mcpResult.content) //! 内部需要content是一个数组!
			};
			//处理其他字段
			if (typeof mcpResult === 'object' && mcpResult !== null) {
				Object.entries(mcpResult).forEach(([key, value]) => {
					if (key !== 'content') {
						result[key] = value;
					}
				});
			}

			addLogs(result, logType.ToolCallResponse);

			return result;
		} catch (error) {
			addLogs(error, logType.ToolCallError);
			throw new Error(
				`调用工具 ${toolName} 失败: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}
}
