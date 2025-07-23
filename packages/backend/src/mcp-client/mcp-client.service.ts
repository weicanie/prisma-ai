import { Client } from '@modelcontextprotocol/sdk/client/index.js'; //得手动引入,插件自动引入有问题
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Injectable } from '@nestjs/common';
import { ErrorCode } from '@prisma-ai/shared';
import { addLogs } from '../utils/log.utils';
import { logType, OpenAITool } from './mcp.type';
import { patchSchemaArrays } from './schemaPatch.util';

interface LocalServerStartCmd {
	command: string;
	args: string[];
	// env?: Record<string, string>;
}
/**
 * MCPClientService
 * 负责连接MCP服务器、getTools、callTool, 增加llm的tools
 */
//* 是否需要transport池? 现在是每次新连接新建一个Transport实例（一个Client实例同一时间只能关联一个Transport、连接一个Server）
@Injectable()
export class MCPClientService {
	clientInfo = {
		name: 'mcp-client',
		version: '1.0.0'
	};

	clientOptions = { capabilities: { tools: {} } };

	constructor() {}
	/**
	 * 连接到本地的MCP服务器（使用本地mcp服务器）
	 * @caution 需要手动close Client实例
	 * @param serverScriptPath 服务器标识符（来源: 脚本路径或配置中的服务器名称）
	 */
	async connectToServerLocal(serverScriptPath: string, configPath: undefined): Promise<Client>;
	/**
	 * 连接到本地的MCP服务器（使用配置文件加载mcp服务器）
	 * @caution 需要手动close Client实例
	 * @param serverIdentifier 服务器标识符（来源: 脚本路径或配置中的服务器名称）
	 * @param configPath MCP服务器配置文件路径（是否传入取决于是通过配置文件还是脚本连接MCP server）
	 */
	async connectToServerLocal(serverIdentifier: string, configPath: string): Promise<Client>;
	/**
	 * 连接到本地的MCP服务器（使用配置文件加载mcp服务器）
	 * @caution 需要手动close Client实例
	 * @param serverIdentifier 服务器标识符（来源: 脚本路径或配置中的服务器名称）
	 * @param configPath MCP服务器配置文件路径（是否传入取决于是通过配置文件还是脚本连接MCP server）
	 */
	async connectToServerLocal(
		serverIdentifier: string,
		configPath: string | undefined
	): Promise<Client> {
		try {
			/**创建传输层参数
			 * 1.MCP server 配置转为传输层参数（MCP）
			 * 		传输层参数用于创建transport（MCP），MCP client 和 MCP server 通过 transport进行通信
			 */
			let transportOptions: {
				command: string;
				args: string[];
				env?: Record<string, string>;
			};
			// 如果使用配置文件方式, 从配置文件加载服务器设置
			if (configPath) {
				try {
					const fs = await import('fs/promises');
					const configContent = await fs.readFile(configPath, 'utf8');
					const config = JSON.parse(configContent);
					// 通过服务器标识符获取其配置
					if (config.mcpServers && config.mcpServers[serverIdentifier]) {
						transportOptions = {
							...config.mcpServers[serverIdentifier]
						};
					} else if (
						//支持设置默认mcp服务器
						serverIdentifier === 'default' &&
						config.defaultServer &&
						config.mcpServers[config.defaultServer]
					) {
						transportOptions = {
							...config.mcpServers[config.defaultServer]
						};
					} else {
						throw new Error(`在配置文件中未找到服务器 ${serverIdentifier}`);
					}
				} catch (error) {
					throw new Error(
						ErrorCode.SERVER_NOT_FOUND +
							`未能从配置文件 '${configPath}' 中加载服务器 '${serverIdentifier} ERROR: ${error}'`
					);
				}
			} else {
				// 如果没有提供配置文件, 将 serverIdentifier 解析为 通过服务器入口脚本本地启动 命令
				transportOptions = this.getTransportOptionsForScript(serverIdentifier);
			}

			const transport = new StdioClientTransport(transportOptions);
			const mcpClient = new Client(this.clientInfo, this.clientOptions);
			await mcpClient.connect(transport);
			return mcpClient;
		} catch (error) {
			addLogs(error, logType.ConnectToServer);
			throw new Error(ErrorCode.SERVER_CONNECTION_ERROR);
		}
	}

	/**
	 * 连接到远程的MCP服务器（无会话模式）
	 * @caution 需要手动close Client实例
	 * @param serverIdentifier 服务器标识符（来源: 配置中的服务器名称）
	 * @param configPath MCP服务器配置文件路径
	 */
	async connectToServerRemote(serverIdentifier: string, configPath: string) {
		let transportOptions: {
			url: string;
		};
		try {
			const fs = await import('fs/promises');
			const configContent = await fs.readFile(configPath, 'utf8');
			const config = JSON.parse(configContent);
			// 通过服务器标识符获取其配置
			if (config.mcpServers && config.mcpServers[serverIdentifier]) {
				transportOptions = {
					...config.mcpServers[serverIdentifier]
				};
			} else if (
				//支持设置默认mcp服务器
				serverIdentifier === 'default' &&
				config.defaultServer &&
				config.mcpServers[config.defaultServer]
			) {
				transportOptions = {
					...config.mcpServers[config.defaultServer]
				};
			} else {
				throw new Error(`在配置文件中未找到远程mcp服务器 ${serverIdentifier}`);
			}
		} catch (error) {
			throw new Error(
				ErrorCode.SERVER_NOT_FOUND +
					`未能从配置文件 '${configPath}' 中加载服务器 '${serverIdentifier} ERROR: ${error}'`
			);
		}
		const transport = new StreamableHTTPClientTransport(new URL(transportOptions.url));
		const mcpClient = new Client(this.clientInfo, this.clientOptions);
		// 连接到服务器(内部会自动发送initialize请求)
		await mcpClient.connect(transport);
		return mcpClient;
	}

	/**
	 * 返回启动本地MCP server的命令及参数作为tansport参数以连接本地MCP server（stdio方式）。
	 * @param scriptPath 脚本路径
	 * @returns 传输层参数 (启动服务器的命令及参数)
	 * @private
	 */
	private getTransportOptionsForScript(scriptPath: string): LocalServerStartCmd {
		//支持js和py脚本
		const isJs = scriptPath.endsWith('.js');
		const isPy = scriptPath.endsWith('.py');

		if (!isJs && !isPy) {
			console.warn('警告: 服务器脚本没有.js或.py扩展名,将尝试使用Node.js运行');
		}

		const command = isPy ? (process.platform === 'win32' ? 'python' : 'python3') : process.execPath;

		return {
			command,
			args: [scriptPath]
		};
	}

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
				ErrorCode.TOOL_GET_ERROR +
					`获取工具列表失败: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * 调用tool获取结果直接返回给llm,	需要自行处理格式
	 * @param toolName 工具名称
	 * @param toolArgs 工具参数
	 * @returns 工具调用结果
	 */
	async callTool(client: Client, toolName: string, toolArgs: Record<string, unknown>) {
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

			addLogs(mcpResult, logType.ToolCallResponse);

			return mcpResult;
		} catch (error) {
			addLogs(error, logType.ToolCallError);
			throw new Error(
				ErrorCode.TOOL_CALL_ERROR +
					`调用工具 ${toolName} 失败: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}
}
