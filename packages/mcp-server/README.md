# MCP Server - 时间工具服务

这是一个基于 Model Context Protocol (MCP) 的服务器，提供一个获取当前时间的工具，支持可选时区参数。使用 NestJS 11 和 TypeScript 构建，通过 StreamableHTTP 与 MCP client 通信。

## 功能特性

- 提供 `getCurrentTime` 工具，用于获取当前时间
- 支持可选时区参数，如 'Asia/Shanghai', 'America/New_York' 等
- 使用 StreamableHTTP 与 MCP client 通信
- 基于 NestJS 11 和 TypeScript 构建
- **新增：支持无状态模式，每个请求独立隔离，避免请求 ID 冲突**
- 代码结构清晰，注释完善，易于扩展

## 技术栈

- NestJS 11
- TypeScript
- @modelcontextprotocol/sdk
- StreamableHTTP 通信协议
- Zod 用于参数验证

## 快速开始

### 安装依赖

```bash
$ pnpm install
```

### 运行服务器

```bash
# 开发模式（自动重载）
$ pnpm run start:dev

# 生产模式
$ pnpm run start:prod
```

服务器将在以下端口启动：

- NestJS 应用: 端口 3000（包含 MCP 端点: /mcp）

## 使用方法

MCP 服务器启动后，可以通过以下两种方式连接：

### 1. 标准 MCP 客户端连接

使用支持 MCP 的客户端（如 Claude Desktop）连接到 `http://localhost:3000/mcp`，然后使用 `getCurrentTime` 工具。

### 2. 直接 HTTP 请求

可以直接向 `/mcp` 端点发送 POST 请求，格式为 JSON-RPC 2.0：

```json
{
	"jsonrpc": "2.0",
	"id": "request-id",
	"method": "callTool",
	"params": {
		"name": "getCurrentTime",
		"params": {
			"timezone": "Asia/Shanghai"
		}
	}
}
```

### 工具参数

- `timezone` (可选): 时区字符串，例如 'Asia/Shanghai', 'America/New_York' 等。如不提供，则使用系统默认时区。

### 返回结果

工具返回以下 JSON 格式数据：

```json
{
	"currentTime": "2025-05-15 14:30:45",
	"timezone": "Asia/Shanghai",
	"utcTime": "2025-05-15T06:30:45.123Z"
}
```

## 项目结构

- `src/mcp-server.service.ts`: MCP 服务器实现，包含获取时间工具的逻辑
- `src/mcp-server.module.ts`: MCP 服务器模块，用于整合到 NestJS 应用
- `src/app.module.ts`: 主应用模块
- `src/main.ts`: 应用入口

## 开发

### 添加新工具

可以在 `mcp-server.service.ts` 文件的 `registerTools` 方法中添加新的工具。

```typescript
// 示例：添加新工具
this.server.tool(
	'newToolName',
	'新工具描述',
	{
		param1: z.string().describe('参数1描述'),
		param2: z.number().optional().describe('可选参数2描述')
	},
	async ({ param1, param2 }) => {
		// 实现工具逻辑
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify({ result: 'result data' }, null, 2)
				}
			]
		};
	}
);
```

## 测试

```bash
# 单元测试
$ pnpm run test

# e2e 测试
$ pnpm run test:e2e
```

## 许可证

[MIT licensed](LICENSE)

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
