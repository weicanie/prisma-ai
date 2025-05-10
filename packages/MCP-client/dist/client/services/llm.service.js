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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
const log_util_1 = require("../utils/log.util");
let LLMService = class LLMService {
    constructor(apiKey, model = 'gpt-3.5-turbo', baseURL = '') {
        this.openai = new openai_1.default({
            baseURL,
            apiKey,
        });
        this.model = model;
    }
    async sendMessage(messages, tools) {
        try {
            (0, log_util_1.addLogs)({
                model: this.model,
                messages,
                tools: (tools === null || tools === void 0 ? void 0 : tools.length) > 0 ? tools : undefined,
                tool_choice: (tools === null || tools === void 0 ? void 0 : tools.length) > 0 ? 'auto' : undefined,
            }, log_util_1.logType.LLMRequest);
            const result = await this.openai.chat.completions.create({
                model: this.model,
                messages,
                tools: (tools === null || tools === void 0 ? void 0 : tools.length) > 0 ? tools : undefined,
                tool_choice: (tools === null || tools === void 0 ? void 0 : tools.length) > 0 ? 'auto' : undefined,
            });
            (0, log_util_1.addLogs)(result, log_util_1.logType.LLMResponse);
            return result;
        }
        catch (error) {
            (0, log_util_1.addLogs)(error, log_util_1.logType.LLMError);
            throw new Error(`发送消息到LLM失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    getModel() {
        return this.model;
    }
    setModel(model) {
        this.model = model;
    }
};
exports.LLMService = LLMService;
exports.LLMService = LLMService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String, String, String])
], LLMService);
//# sourceMappingURL=llm.service.js.map