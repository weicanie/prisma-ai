import { BaseListChatMessageHistory } from '@langchain/core/chat_history';
import {
	BaseMessage,
	StoredMessage,
	mapChatMessagesToStoredMessages,
	mapStoredMessagesToChatMessages
} from '@langchain/core/messages';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface JSONChatHistoryInput {
	sessionId: string;
	dir: string;
}
/**
 * 自定义的ChatHistory, 支持BufferMemory、BufferWindowMemory 、ConversationBufferMemory
 * @description langchain 的 memory 内部会维护一个ChatHistory,如果不传入则使用内置的ChatHistory,传入则使用自定义的ChatHistory
 * @description ConversationSummaryBufferMemory、EntityMemory的支持需要更复杂的实现（用ai）
 */
class JSONChatHistory extends BaseListChatMessageHistory {
	lc_namespace = ['langchain', 'stores', 'message']; //为了序列化为JSON再反序列化时能匹配之前的类

	sessionId: string;
	dir: string;

	constructor(fields: JSONChatHistoryInput) {
		super(fields);
		this.sessionId = fields.sessionId;
		this.dir = fields.dir;
	}
	/* memory调用 */
	async getMessages(): Promise<BaseMessage[]> {
		const filePath = path.join(this.dir, `${this.sessionId}.json`);
		try {
			if (!fs.existsSync(filePath)) {
				this.saveMessagesToFile([]);
				return [];
			}

			const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
			const storedMessages = JSON.parse(data) as StoredMessage[];
			//反序列化
			return mapStoredMessagesToChatMessages(storedMessages);
		} catch (error) {
			console.error(`Failed to read chat history from ${filePath}`, error);
			return [];
		}
	}

	/* memory调用 */
	async addMessages(messages: BaseMessage[]): Promise<void> {
		const existingMessages = await this.getMessages();
		const allMessages = existingMessages.concat(messages);
		await this.saveMessagesToFile(allMessages);
	}

	async addMessage(message: BaseMessage): Promise<void> {
		const messages = await this.getMessages();
		messages.push(message);
		await this.saveMessagesToFile(messages);
	}

	async clear(): Promise<void> {
		const filePath = path.join(this.dir, `${this.sessionId}.json`);
		try {
			fs.unlinkSync(filePath);
		} catch (error) {
			console.error(`Failed to clear chat history from ${filePath}`, error);
		}
	}

	async saveMessagesToFile(messages: BaseMessage[]): Promise<void> {
		const filePath = path.join(this.dir, `${this.sessionId}.json`);
		//确保目录存在
		if (!fs.existsSync(this.dir)) {
			fs.mkdirSync(this.dir, { recursive: true }); //创建目录
		}
		//对 messages 进行序列化，然后用写文件到 json 文件中
		const serializedMessages = mapChatMessagesToStoredMessages(messages);
		try {
			fs.writeFileSync(filePath, JSON.stringify(serializedMessages, null, 2), {
				encoding: 'utf-8'
			});
		} catch (error) {
			console.error(`Failed to save chat history to ${filePath}`, error);
		}
	}
}
//* 文件存储 -> 数据库存储
@Injectable()
export class ChatHistoryService {
	getChatHistory(
		sessionId = 'json_chat_history',
		dir = path.join(process.cwd(), 'ai_data/chat_history_data')
	) {
		return new JSONChatHistory({
			sessionId,
			dir
		});
	}
}
