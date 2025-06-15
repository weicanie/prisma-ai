//OpenAIToolAgent 消费需要的 tool信息
export interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}
//MCP 定义的 MCP server 应提供的工具信息
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

//单个MCPServer的配置
export interface MCPServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  description?: string;
}
//多个MCPServer的配置
export interface MCPServersConfig {
  mcpServers: {
    [key: string]: MCPServerConfig;
  };
  defaultServer?: string;
}

interface ToolCallResult {
  [key: string]: unknown;
}

//tool调用结果（mcp-mongo-server）
export interface MongoToolResult extends ToolCallResult {
  content: string;
}

//日志类型
export enum logType {
  LLMRequest = '[LLM Request]',
  LLMResponse = '[LLM Response]',
  LLMError = '[LLM Error]',
  LLMStream = '[LLM Stream]',

  GetTools = '[GET Tools]',
  GetToolsError = '[GET Tools Error]',
  ConnectToServer = '[Connect To Server]',
  ToolCall = '[Tool Call]',
  ToolCallResponse = '[Tool Call Response]',
  ToolCallError = '[Tool Call Error]',
}
