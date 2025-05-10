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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIService = void 0;
const common_1 = require("@nestjs/common");
const readline = __importStar(require("readline/promises"));
const mcp_client_service_1 = require("./mcp-client.service");
let CLIService = class CLIService {
    constructor(mcpClientService) {
        this.mcpClientService = mcpClientService;
    }
    showUsage() {
        console.log('=====================================================');
        console.log('MCP Client - 模型上下文协议客户端');
        console.log('=====================================================');
        console.log('基本用法:');
        console.log('  node dist/main.js <服务器脚本路径>');
        console.log('使用配置文件:');
        console.log('  node dist/main.js <服务器名称> <配置文件路径>');
        console.log('示例:');
        console.log('  node dist/main.js ../mcp-server/build/index.js');
        console.log('  node dist/main.js memory ./mcp-servers.json');
        console.log('  node dist/main.js default ./mcp-servers.json');
        console.log('=====================================================');
    }
    async run() {
        if (process.argv.length < 3) {
            this.showUsage();
            return;
        }
        const serverIdentifier = process.argv[2];
        const configPath = process.argv.length >= 4 ? process.argv[3] : undefined;
        try {
            if (configPath) {
                console.log(`正在连接到服务器: ${serverIdentifier} (使用配置文件: ${configPath})`);
            }
            else {
                console.log(`正在连接到服务器: ${serverIdentifier}`);
            }
            await this.mcpClientService.connectToServer(serverIdentifier, configPath);
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            try {
                console.log('\n===============================');
                console.log('  MCP客户端已启动!');
                console.log("  输入您的问题或输入'quit'退出");
                console.log('===============================\n');
                while (true) {
                    const message = await rl.question('\n问题: ');
                    if (message.toLowerCase() === 'quit') {
                        console.log('感谢使用MCP客户端，再见！');
                        break;
                    }
                    if (!message.trim()) {
                        console.log('请输入有效的问题');
                        continue;
                    }
                    try {
                        console.log('\n正在思考...');
                        const response = await this.mcpClientService.processQuery(message);
                        console.log('\n回答：');
                        console.log(response);
                    }
                    catch (error) {
                        console.error('\n处理查询失败:', error);
                    }
                }
            }
            finally {
                rl.close();
                await this.mcpClientService.cleanup();
            }
        }
        catch (error) {
            console.error('初始化MCP客户端失败:', error);
            process.exit(1);
        }
    }
};
exports.CLIService = CLIService;
exports.CLIService = CLIService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mcp_client_service_1.MCPClientService])
], CLIService);
//# sourceMappingURL=cli.service.js.map