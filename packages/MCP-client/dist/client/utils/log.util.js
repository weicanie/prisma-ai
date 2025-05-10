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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logType = void 0;
exports.clearLogs = clearLogs;
exports.addLogs = addLogs;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const baseLogsDir = path.join(__dirname, '../../../logs');
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
function getTodayDir() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayDir = path.join(baseLogsDir, `${year}-${month}-${day}`);
    if (!fs.existsSync(todayDir)) {
        fs.mkdirSync(todayDir, { recursive: true });
    }
    return todayDir;
}
function clearLogs() {
    getTodayDir();
}
let index = 0;
function addLogs(logData, logType) {
    const todayDir = getTodayDir();
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const logFileName = `[${index++}] ${logType} ${hours}时${minutes}分${seconds}秒.json`;
    if (logData) {
        fs.writeFileSync(path.join(todayDir, logFileName), JSON.stringify(logData, null, 2), { flag: 'w' });
    }
}
//# sourceMappingURL=log.util.js.map