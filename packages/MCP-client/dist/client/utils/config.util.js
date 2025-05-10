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
exports.defaultConfig = exports.getBaseURL = exports.getModelName = exports.getApiKey = exports.validateEnv = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const validateEnv = () => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY 未设置，请在.env文件中配置您的API密钥');
    }
};
exports.validateEnv = validateEnv;
const getApiKey = () => {
    return process.env.OPENAI_API_KEY || '';
};
exports.getApiKey = getApiKey;
const getModelName = () => {
    return process.env.MODEL_NAME || 'gpt-3.5-turbo';
};
exports.getModelName = getModelName;
const getBaseURL = () => {
    return process.env.BASE_URL || '';
};
exports.getBaseURL = getBaseURL;
exports.defaultConfig = {
    clientName: 'mcp-client-nestjs',
    clientVersion: '1.0.0',
    defaultModel: (0, exports.getModelName)()
};
//# sourceMappingURL=config.util.js.map