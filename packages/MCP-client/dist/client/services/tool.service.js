"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolService = void 0;
const common_1 = require("@nestjs/common");
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const log_util_1 = require("../utils/log.util");
const schema_util_1 = require("../utils/schema.util");
let ToolService = class ToolService {
    constructor(client) {
        this.client = client;
    }
    async getToolsLocal() {
        try {
            const toolsResult = await this.client.listTools();
            const logInfo = toolsResult.tools.map(tool => ({
                name: tool.name,
                description: tool.description,
            }));
            (0, log_util_1.addLogs)(logInfo, log_util_1.logType.GetTools);
            return toolsResult.tools.map(tool => ({
                type: 'function',
                function: {
                    name: tool.name || '',
                    description: tool.description || '',
                    parameters: (0, schema_util_1.patchSchemaArrays)(tool.inputSchema) || {},
                },
            }));
        }
        catch (error) {
            (0, log_util_1.addLogs)(error, log_util_1.logType.GetToolsError);
            throw new Error(`获取本地工具列表失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    ensureContentArray(content) {
        if (!content) {
            return [{ type: 'text', text: '' }];
        }
        if (typeof content === 'string') {
            return [{ type: 'text', text: content }];
        }
        if (Array.isArray(content)) {
            return content.map(item => {
                if (typeof item === 'string') {
                    return { type: 'text', text: item };
                }
                const safeItem = item;
                if (safeItem.type === 'image') {
                    return {
                        type: 'image',
                        data: safeItem.data || '',
                        mimeType: safeItem.mimeType || 'image/png'
                    };
                }
                return {
                    type: 'text',
                    text: safeItem.text || String(safeItem)
                };
            });
        }
        const safeItem = content;
        if (safeItem.type === 'image') {
            return [{
                    type: 'image',
                    data: safeItem.data || '',
                    mimeType: safeItem.mimeType || 'image/png'
                }];
        }
        return [{
                type: 'text',
                text: safeItem.text || String(safeItem)
            }];
    }
    async callToolLocal(toolName, toolArgs) {
        try {
            (0, log_util_1.addLogs)({
                name: toolName,
                arguments: toolArgs,
            }, log_util_1.logType.ToolCall);
            const mcpResult = await this.client.callTool({
                name: toolName,
                arguments: toolArgs,
            });
            const result = {
                content: this.ensureContentArray(mcpResult.content),
            };
            if (typeof mcpResult === 'object' && mcpResult !== null) {
                Object.entries(mcpResult).forEach(([key, value]) => {
                    if (key !== 'content') {
                        result[key] = value;
                    }
                });
            }
            (0, log_util_1.addLogs)(result, log_util_1.logType.ToolCallResponse);
            return result;
        }
        catch (error) {
            (0, log_util_1.addLogs)(error, log_util_1.logType.ToolCallError);
            throw new Error(`调用本地工具 ${toolName} 失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getToolsRemote() {
        throw new Error('远程工具列表获取功能尚未实现');
    }
    async callToolRemote(toolName, toolArgs) {
        throw new Error('远程工具调用功能尚未实现');
    }
};
exports.ToolService = ToolService;
exports.ToolService = ToolService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('MCP_CLIENT')),
    __metadata("design:paramtypes", [index_js_1.Client])
], ToolService);
//# sourceMappingURL=tool.service.js.map