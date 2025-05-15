/**
 * MCP Server Service
 * 提供一个获取当前时间的工具，支持可选时区参数。
 * 用于管理与 NestJS 的集成。
 * 支持无状态模式，为每个请求创建新的服务器实例。
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'; //手动导入 + 加上.js 才能跑通
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

@Injectable()
export class McpServerService implements OnModuleInit, OnModuleDestroy {
	private server: McpServer;
	private transport: StreamableHTTPServerTransport;
	private connectionPromise: Promise<void>;
	private serverConfig = {
		name: 'TimeServer', // 服务器名称
		version: '1.0.0' // 服务器版本
	};

	constructor() {
		// 创建主 MCP 服务器实例（用于传统模式）
		this.server = new McpServer(this.serverConfig);

		// 注册获取当前时间的工具
		this.registerServerTools(this.server);

		// 创建 HTTP Streamable 传输层（用于传统模式）
		this.transport = new StreamableHTTPServerTransport({
			// MCP SDK 不支持直接在transport选项中指定端口
			sessionIdGenerator: () => {
				// 生成唯一的会话 ID
				return randomUUID();
			}
		});
	}

	/**
	 * 获取新的 MCP 服务器实例，用于无状态模式
	 */
	getServer(): McpServer {
		const server = new McpServer(this.serverConfig);
		this.registerServerTools(server);
		return server;
	}

	/**
	 * 注册所有工具到指定的服务器实例
	 */
	public registerServerTools(server: McpServer): void {
		// 注册获取当前时间的工具
		server.tool(
			'getCurrentTime', // 工具名称,
			'根据时区（可选）获取当前时间', // 工具描述
			{
				timezone: z
					.string()
					.optional()
					.describe(
						"时区，例如 'Asia/Shanghai', 'America/New_York' 等（如不提供，则使用系统默认时区）"
					)
			},
			async ({ timezone }) => {
				try {
					// 获取当前时间
					const now = new Date();

					// 格式化时间
					let formattedTime;

					if (timezone) {
						// 使用用户提供的时区格式化时间
						formattedTime = now.toLocaleString('zh-CN', {
							timeZone: timezone,
							year: 'numeric',
							month: '2-digit',
							day: '2-digit',
							hour: '2-digit',
							minute: '2-digit',
							second: '2-digit',
							hour12: false
						});
					} else {
						// 使用系统默认时区
						formattedTime = now.toLocaleString('zh-CN', {
							year: 'numeric',
							month: '2-digit',
							day: '2-digit',
							hour: '2-digit',
							minute: '2-digit',
							second: '2-digit',
							hour12: false
						});
					}

					const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

					// 返回 MCP 格式的结果
					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify(
									{
										currentTime: formattedTime,
										timezone: timezone || systemTimezone,
										utcTime: now.toISOString()
									},
									null,
									2
								)
							}
						]
					};
				} catch (error) {
					// 错误处理
					return {
						content: [
							{
								type: 'text',
								text: `错误: ${timezone ? `无效的时区: ${timezone}. ` : ''}${error instanceof Error ? error.message : '未知错误'}`
							}
						],
						isError: true
					};
				}
			}
		);
	}

	/**
	 * 当模块初始化时启动 MCP 服务器（传统模式）
	 */
	async onModuleInit() {
		// 连接服务器与传输层
		this.connectionPromise = this.server.connect(this.transport);

		// 等待连接完成
		await this.connectionPromise;
		console.log('MCP Server stateful StreamableHTTP 启动成功');
	}

	/**
	 * 当模块销毁时关闭 MCP 服务器
	 */
	async onModuleDestroy(): Promise<void> {
		if (this.server) {
			await this.server.close();
			console.log('MCP Server stopped');
		}
	}
}
