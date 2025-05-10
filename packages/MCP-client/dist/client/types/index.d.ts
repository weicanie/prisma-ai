export interface OpenAITool {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: Record<string, any>;
    };
}
export interface MCPTool {
    name: string;
    description: string;
    inputSchema: Record<string, any>;
}
export interface BaseContentItem {
    type: string;
    [key: string]: unknown;
}
export interface TextContentItem extends BaseContentItem {
    type: 'text';
    text: string;
}
export interface ImageContentItem extends BaseContentItem {
    type: 'image';
    data: string;
    mimeType: string;
}
export type ContentItem = TextContentItem | ImageContentItem;
export interface ToolCallResult {
    content: ContentItem[];
    [key: string]: unknown;
}
export interface MCPServerConfig {
    command: string;
    args?: string[];
    env?: Record<string, string>;
    description?: string;
}
export interface MCPServersConfig {
    mcpServers: {
        [key: string]: MCPServerConfig;
    };
    defaultServer?: string;
}
export declare enum logType {
    GetTools = "[GET Tools]",
    GetToolsError = "[GET Tools Error]",
    ConnectToServer = "[Connect To Server]",
    LLMRequest = "[LLM Request]",
    LLMResponse = "[LLM Response]",
    LLMError = "[LLM Error]",
    LLMStream = "[LLM Stream]",
    ToolCall = "[Tool Call]",
    ToolCallResponse = "[Tool Call Response]",
    ToolCallError = "[Tool Call Error]",
    ServiceCall = "[Service Call]",
    ServiceError = "[Service Error]"
}
