import type {
	AIChatLLM,
	ChatMessage,
	ConversationDto,
	ConversationSendDto,
	MessageSendDto,
	ServerDataFormat,
	UserModelConfig
} from '@prisma-ai/shared';
import { instance } from './config';

/**
 * 获取会话列表
 * @returns 会话列表
 */
export async function getConversationList() {
	const res = await instance.get<ServerDataFormat<ConversationDto[]>>('/aichat');
	return res.data;
}

/**
 * 发送消息到AI
 * @param message 消息
 * @param messages 会话列表
 * @returns 消息
 */
export async function sendMessageToAI<T = AIChatLLM>(
	message: ChatMessage,
	keyname: string,
	modelConfig: UserModelConfig<T>
) {
	const body = { message, keyname, modelConfig };
	const res = await instance.post<MessageSendDto<T>, ServerDataFormat<string>>('/aichat', body);
	return res.data;
}

/**
 * 保存会话
 * @param key 会话key
 * @param label 会话label
 * @param content 会话内容
 * @returns 会话
 */
export async function storeConversation(key: string, label: string, content: ChatMessage[]) {
	const body = { keyname: key, label, content };
	const res = await instance.post<ConversationSendDto, ServerDataFormat<string>>(
		'/aichat/store',
		body
	);
	return res.data;
}
