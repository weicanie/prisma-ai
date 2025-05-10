"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPClientService = void 0;
const common_1 = require("@nestjs/common");
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/client/stdio.js");
const llm_service_1 = require("./llm.service");
const tool_service_1 = require("./tool.service");
const config_util_1 = require("../utils/config.util");
const log_util_1 = require("../utils/log.util");
let MCPClientService = class MCPClientService {
    constructor(mcp, llmService, toolService) {
        this.mcp = mcp;
        this.llmService = llmService;
        this.toolService = toolService;
        this.transport = null;
        this.tools = [];
        this.messages = [];
        (0, config_util_1.validateEnv)();
        this.llmService = new llm_service_1.LLMService((0, config_util_1.getApiKey)(), (0, config_util_1.getModelName)(), (0, config_util_1.getBaseURL)());
    }
    getTransportOptionsForScript(scriptPath) {
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
    async connectToServer(serverIdentifier, configPath) {
        try {
            let transportOptions;
            if (configPath) {
                try {
                    const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
                    const configContent = await fs.readFile(configPath, 'utf8');
                    const config = JSON.parse(configContent);
                    this.systemPrompt = config.system;
                    this.messages.push({
                        role: 'system',
                        content: this.systemPrompt || ''
                    });
                    if (config.mcpServers && config.mcpServers[serverIdentifier]) {
                        transportOptions = Object.assign({}, config.mcpServers[serverIdentifier]);
                    }
                    else if (serverIdentifier === 'default' &&
                        config.defaultServer &&
                        config.mcpServers[config.defaultServer]) {
                        transportOptions = Object.assign({}, config.mcpServers[config.defaultServer]);
                    }
                    else {
                        throw new Error(`在配置文件中未找到服务器 ${serverIdentifier}`);
                    }
                }
                catch (error) {
                    throw new Error(`未能从配置文件 '${configPath}' 中加载服务器 '${serverIdentifier}'`);
                }
            }
            else {
                transportOptions = this.getTransportOptionsForScript(serverIdentifier);
            }
            this.transport = new stdio_js_1.StdioClientTransport(transportOptions);
            this.mcp.connect(this.transport);
            try {
                this.tools = await this.toolService.getToolsLocal();
            }
            catch (error) {
                this.tools = await this.toolService.getToolsRemote();
            }
        }
        catch (error) {
            (0, log_util_1.addLogs)(error, log_util_1.logType.ConnectToServer);
            throw new Error(`连接失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async processQuery(query) {
        var _a, _b;
        try {
            this.messages.push({ role: 'user', content: query });
            const response = await this.llmService.sendMessage(this.messages, this.tools);
            const finalText = [];
            if (!((_a = response.choices) === null || _a === void 0 ? void 0 : _a[0])) {
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
            if (((_b = responseMessage.tool_calls) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                this.messages.push(responseMessage);
                for (const toolCall of responseMessage.tool_calls) {
                    if (toolCall.type === 'function') {
                        const toolName = toolCall.function.name;
                        const toolArgs = JSON.parse(toolCall.function.arguments || '{}');
                        finalText.push(`\n[调用工具 ${toolName}，参数 ${JSON.stringify(toolArgs, null, 2)}]\n`);
                        try {
                            let result;
                            try {
                                result = await this.toolService.callToolLocal(toolName, toolArgs);
                            }
                            catch (_c) {
                                result = await this.toolService.callToolRemote(toolName, toolArgs);
                            }
                            const content = typeof result.content === 'string'
                                ? result.content
                                : JSON.stringify(result.content);
                            this.messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content
                            });
                        }
                        catch (toolError) {
                            const errorMessage = `错误: ${toolError instanceof Error ? toolError.message : String(toolError)}`;
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
                }
                catch (followupError) {
                    finalText.push(`[获取后续响应失败: ${followupError instanceof Error ? followupError.message : String(followupError)}]`);
                }
            }
            return finalText.join('\n');
        }
        catch (error) {
            console.error('处理查询失败:', error);
            return `处理查询时出错: ${error instanceof Error ? error.message : String(error)}`;
        }
    }
    async cleanup() {
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
            }
            catch (error) {
                console.error('关闭MCP客户端时出错:', error);
            }
        }
    }
};
exports.MCPClientService = MCPClientService;
exports.MCPClientService = MCPClientService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('MCP_CLIENT')),
    __metadata("design:paramtypes", [index_js_1.Client,
        llm_service_1.LLMService,
        tool_service_1.ToolService])
], MCPClientService);
//# sourceMappingURL=mcp-client.service.js.map