import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { OpenAITool, ToolCallResult } from '../types';
export declare class ToolService {
    private readonly client;
    constructor(client: Client);
    getToolsLocal(): Promise<OpenAITool[]>;
    private ensureContentArray;
    callToolLocal(toolName: string, toolArgs: Record<string, unknown>): Promise<ToolCallResult>;
    getToolsRemote(): Promise<OpenAITool[]>;
    callToolRemote(toolName: string, toolArgs: Record<string, unknown>): Promise<ToolCallResult>;
}
