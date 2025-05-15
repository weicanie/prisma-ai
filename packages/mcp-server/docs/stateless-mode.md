# MCP Server 无状态模式实现文档

## 概述

本文档描述了 MCP Server 无状态模式的实现，该模式为每个请求创建独立的服务器实例，确保请求之间的完全隔离，避免在多客户端同时连接时发生请求 ID 冲突。

## 架构变更

### 1. 从传统模式到无状态模式

原来的实现使用单一的 MCP 服务器实例处理所有请求，这可能导致以下问题：

- 多个客户端同时连接时的请求 ID 冲突
- 会话状态混淆
- 请求处理相互影响

新的无状态模式通过为每个请求创建新的服务器和传输层实例，确保请求之间的完全隔离。

### 2. API 入口点

添加了专用的 `/mcp` 端点，使用 NestJS 控制器处理 MCP 请求：

```typescript
@Controller('mcp')
export class McpController {
	// POST、GET、DELETE 处理方法
}
```

## 关键实现

### 1. 无状态服务器创建

```typescript
// McpServerService 中添加获取新服务器实例的方法
getServer(): McpServer {
  const server = new McpServer(this.serverConfig);
  this.registerServerTools(server);
  return server;
}
```

### 2. 请求隔离处理

```typescript
@Post()
async handleMcpRequest(@Req() req: Request, @Res() res: Response, @Body() body: any) {
  // 为每个请求创建新的服务器和传输层实例
  const server = this.mcpServerService.getServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  // 连接并处理请求
  await server.connect(transport);
  await transport.handleRequest(req, res, body);

  // 请求结束后清理资源
  res.on('close', () => {
    transport.close();
    server.close();
  });
}
```

### 3. 工具注册方法重构

将工具注册从服务构造函数中分离出来，改为可以应用于任何服务器实例的方法：

```typescript
private registerServerTools(server: McpServer): void {
  // 注册工具到指定的服务器实例
}
```

## 优势

1. **隔离性强**: 每个请求都有自己的服务器和传输层实例，避免状态混淆
2. **避免 ID 冲突**: 不同客户端的请求不会相互影响
3. **更好的错误恢复**: 单个请求的错误不会影响其他请求
4. **扩展性好**: 可以轻松水平扩展，部署多个实例

## 使用方式

### 客户端连接

MCP 客户端可以通过以下地址连接到服务器：

```
http://localhost:3000/mcp
```

### 工具调用示例

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

## 注意事项

1. 无状态模式可能会增加服务器资源消耗，因为每个请求都要创建新的实例
2. 对于需要跨请求保持状态的场景不适用
3. 工具配置必须保持一致，避免不同实例提供不同的功能
