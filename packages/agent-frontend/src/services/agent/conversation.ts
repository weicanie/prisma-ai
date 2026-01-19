import type {
	ChatMessage,
	ConversationDto,
	ConversationSendDto,
	ServerDataFormat
} from '@prisma-ai/shared';
import { instance } from '../config';

/**
 * 获取会话列表
 * @returns 会话列表
 */
export async function getConversationList(project_id: string) {
	const res = await instance.get<ServerDataFormat<ConversationDto[]>>(
		`/prisma_agent/${project_id}`
	);
	return res.data;
}

/**
 * 初始化项目的第一个空会话、更新已有的会话
 * @param key 会话key
 * @param label 会话label
 * @param content 会话内容
 * @returns 会话
 */
export async function storeConversation(
	key: string,
	label: string,
	content: ChatMessage[],
	project_id: string
) {
	const body = { keyname: key, label, content, project_id };
	const res = await instance.post<ConversationSendDto, ServerDataFormat<string>>(
		'/prisma_agent/store',
		body
	);
	return res.data;
}

/**
 * 给项目新建一个会话
 * @param key 会话key
 * @param label 会话label
 * @param content 会话内容
 * @returns 会话
 */
export async function startNewConversation(
	key: string,
	label: string,
	content: ChatMessage[],
	project_id: string
) {
	const body = { keyname: key, label, content, project_id };
	const res = await instance.post<ConversationSendDto, ServerDataFormat<string>>(
		'/prisma_agent/store-new',
		body
	);
	return res.data;
}
