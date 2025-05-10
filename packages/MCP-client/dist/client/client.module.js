"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const llm_service_1 = require("./services/llm.service");
const tool_service_1 = require("./services/tool.service");
const mcp_client_service_1 = require("./services/mcp-client.service");
const cli_service_1 = require("./services/cli.service");
const log_interceptor_1 = require("./interceptors/log.interceptor");
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const config_util_1 = require("./utils/config.util");
let ClientModule = class ClientModule {
};
exports.ClientModule = ClientModule;
exports.ClientModule = ClientModule = __decorate([
    (0, common_1.Module)({
        providers: [
            llm_service_1.LLMService,
            tool_service_1.ToolService,
            mcp_client_service_1.MCPClientService,
            cli_service_1.CLIService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: log_interceptor_1.LogInterceptor,
            },
            {
                provide: 'MCP_CLIENT',
                useValue: new index_js_1.Client({
                    name: config_util_1.defaultConfig.clientName,
                    version: config_util_1.defaultConfig.clientVersion
                }),
            },
        ],
    })
], ClientModule);
//# sourceMappingURL=client.module.js.map