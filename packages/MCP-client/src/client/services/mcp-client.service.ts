import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Inject, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { OpenAITool } from '../types';
import { getApiKey, getBaseURL, getModelName, validateEnv } from '../utils/config.util';
import { addLogs, logType } from '../utils/log.util';
import { LLMService } from './llm.service';
import { ToolService } from './tool.service';

@Injectable()
export class MCPClientService {
	private transport: StdioClientTransport | null = null;
	private tools: OpenAITool[] = [];
	private systemPrompt?: string;
	private messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [];

	constructor(
		@Inject('MCP_CLIENT') private readonly mcp: Client,
		private readonly llmService: LLMService,
		private readonly toolService: ToolService
	) {
		validateEnv();
		this.llmService = new LLMService(getApiKey(), getModelName(), getBaseURL());
	}

	private getTransportOptionsForScript(scriptPath: string): {
		command: string;
		args: string[];
		env?: Record<string, string>;
	} {
		const isJs = scriptPath.endsWith('.js');
		const isPy = scriptPath.endsWith('.py');

		if (!isJs && !isPy) {
			console.warn('警告: 服务器脚本没有.js或.py扩展名，将尝试使用Node.js运行');
		}

		const command = isPy ? (process.platform === 'win32' ? 'python' : 'python3') : process.execPath;

		return {
			command,
			args: [scriptPath]
		};
	}

	async connectToServer(serverIdentifier: string, configPath?: string): Promise<void> {
		try {
			let transportOptions: {
				command: string;
				args: string[];
				env?: Record<string, string>;
			};

			if (configPath) {
				try {
					const fs = await import('fs/promises');
					const configContent = await fs.readFile(configPath, 'utf8');
					const config = JSON.parse(configContent);

					this.systemPrompt = config.system;
					this.messages.push({
						role: 'system',
						content: this.systemPrompt || ''
					});

					if (config.mcpServers && config.mcpServers[serverIdentifier]) {
						transportOptions = {
							...config.mcpServers[serverIdentifier]
						};
					} else if (
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
					throw new Error(`未能从配置文件 '${configPath}' 中加载服务器 '${serverIdentifier}'`);
				}
			} else {
				transportOptions = this.getTransportOptionsForScript(serverIdentifier);
			}

			this.transport = new StdioClientTransport(transportOptions);
			this.mcp.connect(this.transport);

			// 优先尝试获取本地工具列表
			try {
				this.tools = await this.toolService.getToolsLocal();
			} catch (error) {
				// 如果本地工具获取失败，尝试获取远程工具列表
				this.tools = await this.toolService.getToolsRemote();
			}
		} catch (error) {
			addLogs(error, logType.ConnectToServer);
			throw new Error(`连接失败: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	async processQuery(query: string): Promise<string> {
		try {
			this.messages.push({ role: 'user', content: query });

			const response = await this.llmService.sendMessage(this.messages, this.tools);
			const finalText: string[] = [];

			if (!response.choices?.[0]) {
				throw new Error('无效的LLM响应');
			}

			const responseMessage = response.choices[0].message;

			if (responseMessage.content) {
				finalText.push(responseMessage.content);
				this.messages.push({
					role: 'assistant',
					content: responseMessage.content
				});
			}

			if (responseMessage.tool_calls?.length > 0) {
				this.messages.push(responseMessage);

				for (const toolCall of responseMessage.tool_calls) {
					if (toolCall.type === 'function') {
						const toolName = toolCall.function.name;
						const toolArgs = JSON.parse(toolCall.function.arguments || '{}');

						finalText.push(`\n[调用工具 ${toolName}，参数 ${JSON.stringify(toolArgs, null, 2)}]\n`);

						try {
							// 优先尝试本地工具调用
							let result;
							try {
								result = await this.toolService.callToolLocal(toolName, toolArgs);
							} catch {
								// 如果本地调用失败，尝试远程调用
								result = await this.toolService.callToolRemote(toolName, toolArgs);
							}

							const content =
								typeof result.content === 'string'
									? result.content
									: JSON.stringify(result.content);

							this.messages.push({
								role: 'tool',
								tool_call_id: toolCall.id,
								content
							});
						} catch (toolError) {
							const errorMessage = `错误: ${
								toolError instanceof Error ? toolError.message : String(toolError)
							}`;

							this.messages.push({
								role: 'tool',
								tool_call_id: toolCall.id,
								content: errorMessage
							});

							finalText.push(`[工具调用失败: ${errorMessage}]`);
						}
					}
				}

				try {
					const followupResponse = await this.llmService.sendMessage(this.messages);
					const followupContent = followupResponse.choices[0].message.content;

					if (followupContent) {
						finalText.push(followupContent);
						this.messages.push({
							role: 'assistant',
							content: followupContent
						});
					}
				} catch (followupError) {
					finalText.push(
						`[获取后续响应失败: ${
							followupError instanceof Error ? followupError.message : String(followupError)
						}]`
					);
				}
			}

			return finalText.join('\n');
		} catch (error) {
			console.error('处理查询失败:', error);
			return `处理查询时出错: ${error instanceof Error ? error.message : String(error)}`;
		}
	}

	async cleanup(): Promise<void> {
		this.messages = [];
		if (this.systemPrompt) {
			this.messages.push({
				role: 'system',
				content: this.systemPrompt
			});
		}

		if (this.mcp) {
			try {
				await this.mcp.close();
			} catch (error) {
				console.error('关闭MCP客户端时出错:', error);
			}
		}
	}
}
