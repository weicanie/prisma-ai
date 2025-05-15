import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { McpServerService } from './mcp-server.service';

/* 
  就是请求响应那一套,通过包一层统一格式
*/
@Controller('mcp')
export class McpController {
	//连接池
	private transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};
	constructor(private readonly mcpServerService: McpServerService) {}

	/** 不使用会话, mcp client 直接发送POST请求来获取、调用tools
	 * 每个请求创建新的传输层和服务器实例。
	 */
	@Post()
	async handleMcpRequest(@Req() req: Request, @Res() res: Response, @Body() body: any) {
		try {
			// 获取 MCP 服务器实例
			const server = this.mcpServerService.getServer();

			// 为此请求创建新的传输层
			const transport = new StreamableHTTPServerTransport({
				sessionIdGenerator: undefined // stateless模式（服务器不语, 只是一味响应请求）
			});

			// 连接服务器与传输层
			await server.connect(transport);

			/* 内部自动处理请求
        过程：
          处理 MCP 客户端发来的请求，根据请求中指定的工具名称调用对应的工具函数，并将结果返回给客户端。
        细节：
          当 MCP 客户端通过 JSON-RPC 请求调用 callTool 方法并指定 toolname 作为工具名称时，transport.handleRequest 会：
          1.识别这是一个工具调用请求、2.查找名为 toolname 的已注册工具、3.验证提供的参数（检查参数是否符合定义的规则）、4.执行工具的实现函数，传入参数、5.将工具返回的结果格式化为 JSON-RPC 响应发送回客户端
      */
			await transport.handleRequest(req, res, body);

			// 请求结束后清理资源
			res.on('close', () => {
				console.log('Request closed');
				transport.close();
				server.close();
			});
		} catch (error) {
			console.error('Error handling MCP request:', error);
			if (!res.headersSent) {
				res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
					jsonrpc: '2.0',
					error: {
						code: -32603,
						message: 'Internal server error'
					},
					id: null
				});
			}
		}
	}
	/* 使用会话, MCP client 先发送 InitializeRequest 建立会话, 然后通过sessionId复用会话。
  后续 MCP client通过GET请求获取tools、通过POST请求调用工具。
  */
	//客户端需要在'mcp-session-id'headers中上传会话ID, 以复用原会话（stateful）
	@Post('session')
	async handleMcpRequestSession(@Req() req: Request, @Res() res: Response, @Body() body: any) {
		const sessionId = req.headers['mcp-session-id'] as string | undefined;
		let transport: StreamableHTTPServerTransport;

		if (sessionId && this.transports[sessionId]) {
			transport = this.transports[sessionId];
		} else if (!sessionId && isInitializeRequest(req.body)) {
			transport = new StreamableHTTPServerTransport({
				sessionIdGenerator: () => randomUUID(),
				onsessioninitialized: sessionId => {
					this.transports[sessionId] = transport;
				}
			});

			transport!.onclose = () => {
				if (transport.sessionId) {
					delete this.transports[transport.sessionId];
				}
			};
			//TODO 连接池等抽取到service中
			const server = new McpServer({
				name: 'example-server',
				version: '1.0.0'
			});
			//* 别忘了配置服务器的tools、resources、prompts等
			this.mcpServerService.registerServerTools(server);

			await server.connect(transport);
		} else {
			res.status(400).json({
				jsonrpc: '2.0',
				error: {
					code: -32000,
					message: 'Bad Request: No valid session ID provided'
				},
				id: null
			});
			return;
		}

		// Handle the request
		await transport.handleRequest(req, res, req.body);
	}

	@Get('session')
	async handleSessionRequest(@Req() req: Request, @Res() res: Response) {
		const sessionId = req.headers['mcp-session-id'] as string | undefined;
		if (!sessionId || !this.transports[sessionId]) {
			res.status(400).send('Invalid or missing session ID');
			return;
		}

		const transport = this.transports[sessionId];
		await transport.handleRequest(req, res);
	}
	//无会话的连接请使用POST请求
	@Get()
	handleMcpGetRequest(@Req() req: Request, @Res() res: Response) {
		console.log('Received GET MCP request');
		res.writeHead(HttpStatus.METHOD_NOT_ALLOWED).end(
			JSON.stringify({
				jsonrpc: '2.0',
				error: {
					code: -32000,
					message: '无会话的连接请使用POST请求,或者携带有效的会话ID'
				},
				id: null
			})
		);
	}
}
