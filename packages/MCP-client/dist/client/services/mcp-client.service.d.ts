import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { LLMService } from './llm.service';
import { ToolService } from './tool.service';
export declare class MCPClientService {
    private readonly mcp;
    private readonly llmService;
    private readonly toolService;
    private transport;
    private tools;
    private systemPrompt?;
    private messages;
    constructor(mcp: Client, llmService: LLMService, toolService: ToolService);
    private getTransportOptionsForScript;
    connectToServer(serverIdentifier: string, configPath?: string): Promise<void>;
    processQuery(query: string): Promise<string>;
    cleanup(): Promise<void>;
}
