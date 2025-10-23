/**
 * 用户配置，包括LLM厂商API密钥、Pinecone API密钥等
 * 通过浏览器本地存储(localStorage)进行管理
 */

import { isOnline } from '@/utils/constants';
import { initialUserConfig, type UserConfig } from '@prisma-ai/shared';

// 本地存储键名
const USER_CONFIG_KEY = 'prisma_user_config';

/**
 * 获取用户配置
 * @returns 用户配置对象
 */
export function getUserConfig(): UserConfig {
	try {
		const stored = localStorage.getItem(USER_CONFIG_KEY);
		if (stored) {
			const parsedConfig = JSON.parse(stored);
			// 合并默认配置，确保新增字段有默认值
			return mergeConfig(initialUserConfig, parsedConfig);
		}
	} catch (error) {
		console.error('获取用户配置失败:', error);
	}
	return { ...initialUserConfig };
}

/**
 * 保存用户配置
 * @param config 用户配置对象
 */
export function saveUserConfig(config: UserConfig): void {
	try {
		localStorage.setItem(USER_CONFIG_KEY, JSON.stringify(config));
	} catch (error) {
		console.error('保存用户配置失败:', error);
		throw new Error('保存用户配置失败');
	}
}

/**
 * 检查配置是否完整（必填项是否已填写）
 * @param config 用户配置对象
 * @returns 检查结果
 */
export function validateUserConfig(config: UserConfig): {
	isValid: boolean;
	missingFields: string[];
} {
	const missingFields: string[] = [];

	// 检查必填项：Pinecone API Key
	if (!config.vectorDb.pinecone.apiKey) {
		missingFields.push('Pinecone API Key');
	}

	// 检查必填项：openai.apiKey
	if (!config.llm.openai.apiKey) {
		missingFields.push('国内代理 API Key');
	}

	// 检查至少有一个LLM配置
	const hasLLMConfig = isOnline
		? config.llm.deepseek.apiKey
		: config.llm.deepseek.apiKey || config.llm.googleai.apiKey;

	if (!hasLLMConfig) {
		missingFields.push(isOnline ? 'DeepSeek API Key' : '至少一个LLM API Key (DeepSeek/Google AI)');
	}

	return {
		isValid: missingFields.length === 0,
		missingFields
	};
}

/**
 * 深度合并配置对象
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
function mergeConfig(target: any, source: any): any {
	const result = { ...target };

	for (const key in source) {
		if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
			result[key] = mergeConfig(target[key] || {}, source[key]);
		} else {
			result[key] = source[key];
		}
	}

	return result;
}
