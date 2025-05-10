"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logType = void 0;
var logType;
(function (logType) {
    logType["GetTools"] = "[GET Tools]";
    logType["GetToolsError"] = "[GET Tools Error]";
    logType["ConnectToServer"] = "[Connect To Server]";
    logType["LLMRequest"] = "[LLM Request]";
    logType["LLMResponse"] = "[LLM Response]";
    logType["LLMError"] = "[LLM Error]";
    logType["LLMStream"] = "[LLM Stream]";
    logType["ToolCall"] = "[Tool Call]";
    logType["ToolCallResponse"] = "[Tool Call Response]";
    logType["ToolCallError"] = "[Tool Call Error]";
    logType["ServiceCall"] = "[Service Call]";
    logType["ServiceError"] = "[Service Error]";
})(logType || (exports.logType = logType = {}));
//# sourceMappingURL=index.js.map