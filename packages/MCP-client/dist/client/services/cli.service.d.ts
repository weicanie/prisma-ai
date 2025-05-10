import { MCPClientService } from './mcp-client.service';
export declare class CLIService {
    private readonly mcpClientService;
    constructor(mcpClientService: MCPClientService);
    showUsage(): void;
    run(): Promise<void>;
}
