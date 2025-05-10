import * as dotenv from 'dotenv';

dotenv.config();

export const validateEnv = (): void => {
	const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
	if (!OPENAI_API_KEY) {
		throw new Error('OPENAI_API_KEY 未设置，请在.env文件中配置您的API密钥');
	}
};

export const getApiKey = (): string => {
	return process.env.OPENAI_API_KEY || '';
};

export const getModelName = (): string => {
	return process.env.MODEL_NAME || 'gpt-3.5-turbo';
};

export const getBaseURL = (): string => {
	return process.env.BASE_URL || '';
};

export const defaultConfig = {
	clientName: 'mcp-client-nestjs',
	clientVersion: '1.0.0',
	defaultModel: getModelName()
};
