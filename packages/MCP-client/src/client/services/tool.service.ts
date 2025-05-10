import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { Inject, Injectable } from '@nestjs/common';
import type {
	ContentItem,
	ImageContentItem,
	OpenAITool,
	TextContentItem,
	ToolCallResult
} from '../types';
import { addLogs, logType } from '../utils/log.util';
import { patchSchemaArrays } from '../utils/schema.util';

@Injectable()
export class ToolService {
	constructor(@Inject('MCP_CLIENT') private readonly client: Client) {}

	/**
	 * 获取本地MCP服务器提供的工具列表
	 */
	async getToolsLocal(): Promise<OpenAITool[]> {
		try {
			const toolsResult = await this.client.listTools();

			const logInfo = toolsResult.tools.map(tool => ({
				name: tool.name,
				description: tool.description
			}));

			addLogs(logInfo, logType.GetTools);

			return toolsResult.tools.map(tool => ({
				type: 'function' as const,
				function: {
					name: tool.name || '',
					description: tool.description || '',
					parameters: patchSchemaArrays(tool.inputSchema) || {}
				}
			}));
		} catch (error) {
			addLogs(error, logType.GetToolsError);
			throw new Error(
				`获取本地工具列表失败: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	private ensureContentArray(content: unknown): ContentItem[] {
		if (!content) {
			return [{ type: 'text', text: '' } as TextContentItem];
		}

		if (typeof content === 'string') {
			return [{ type: 'text', text: content } as TextContentItem];
		}

		if (Array.isArray(content)) {
			return content.map(item => {
				if (typeof item === 'string') {
					return { type: 'text', text: item } as TextContentItem;
				}

				const safeItem = item as any;
				if (safeItem.type === 'image') {
					return {
						type: 'image',
						data: safeItem.data || '',
						mimeType: safeItem.mimeType || 'image/png'
					} as ImageContentItem;
				}

				return {
					type: 'text',
					text: safeItem.text || String(safeItem)
				} as TextContentItem;
			});
		}

		// Single item that's not a string
		const safeItem = content as any;
		if (safeItem.type === 'image') {
			return [
				{
					type: 'image',
					data: safeItem.data || '',
					mimeType: safeItem.mimeType || 'image/png'
				} as ImageContentItem
			];
		}

		return [
			{
				type: 'text',
				text: safeItem.text || String(safeItem)
			} as TextContentItem
		];
	}

	/**
	 * 调用本地MCP工具
	 */
	async callToolLocal(
		toolName: string,
		toolArgs: Record<string, unknown>
	): Promise<ToolCallResult> {
		try {
			addLogs(
				{
					name: toolName,
					arguments: toolArgs
				},
				logType.ToolCall
			);

			const mcpResult = await this.client.callTool({
				name: toolName,
				arguments: toolArgs
			});

			// Create result with properly typed content
			const result: ToolCallResult = {
				content: this.ensureContentArray(mcpResult.content)
			};

			// Copy any additional properties
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
				`调用本地工具 ${toolName} 失败: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * 获取远程MCP服务器提供的工具列表
	 * TODO: 实现远程MCP server通信
	 */
	async getToolsRemote(): Promise<OpenAITool[]> {
		throw new Error('远程工具列表获取功能尚未实现');
	}

	/**
	 * 调用远程MCP工具
	 * TODO: 实现远程MCP server通信
	 */
	async callToolRemote(
		toolName: string,
		toolArgs: Record<string, unknown>
	): Promise<ToolCallResult> {
		throw new Error('远程工具调用功能尚未实现');
	}
}
