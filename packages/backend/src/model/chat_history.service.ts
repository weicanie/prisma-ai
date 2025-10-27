import { BaseListChatMessageHistory } from '@langchain/core/chat_history';
import {
	BaseMessage,
	mapChatMessagesToStoredMessages,
	mapStoredMessagesToChatMessages
} from '@langchain/core/messages';
import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../DB/db.service';

interface DBChatHistoryInput {
	keyname: string;
	dbService: DbService;
}

class DBChatHistory extends BaseListChatMessageHistory {
	lc_namespace = ['langchain', 'stores', 'message']; //为了序列化为JSON再反序列化时能匹配之前的类
	keyname: string;
	dbService: DbService;
	constructor(fields: DBChatHistoryInput) {
		super(fields);
		this.keyname = fields.keyname;
		this.dbService = fields.dbService;
	}

	/**
	 * 获取对话历史
	 * @returns 对话历史
	 */
	async getMessages(): Promise<BaseMessage[]> {
		const data = await this.dbService.ai_conversation.findFirst({
			where: {
				keyname: this.keyname
			}
		});

		let history = data?.history;
		if (!history) {
			this.saveMessagesToDB(data?.id!, []);
			history = '[]';
		}

		let messagesJSON: any;
		try {
			messagesJSON = JSON.parse(history as string);
		} catch (error) {
			messagesJSON = [];
		}

		const messages = mapStoredMessagesToChatMessages(messagesJSON);
		return messages;
	}

	/**
	 * 添加对话记录
	 * @param messages 对话记录
	 */
	async addMessages(messages: BaseMessage[]): Promise<void> {
		const existingMessages = await this.getMessages();
		const allMessages = existingMessages.concat(messages);

		const data = await this.dbService.ai_conversation.findFirst({
			where: {
				keyname: this.keyname
			}
		});

		await this.saveMessagesToDB(data?.id!, allMessages);
	}

	async addMessage(message: BaseMessage): Promise<void> {
		const messages = await this.getMessages();

		const data = await this.dbService.ai_conversation.findFirst({
			where: {
				keyname: this.keyname
			}
		});

		messages.push(message);
		await this.saveMessagesToDB(data?.id!, messages);
	}

	async saveMessagesToDB(id: number, messages: BaseMessage[]): Promise<void> {
		if (!id) {
			console.error('saveMessagesToDB ~ id is null, fail to save messages:', messages);
			return;
		}
		const messagesJSON = mapChatMessagesToStoredMessages(messages);
		await this.dbService.ai_conversation.update({
			where: { id },
			data: { history: JSON.stringify(messagesJSON) as any }
		});
	}
}
@Injectable()
export class ChatHistoryService {
	logger = new Logger('ChatHistoryService');
	keyname: string;
	constructor(private readonly dbService: DbService) {}

	/**
	 * 获取对话历史管理器
	 * @param keyname 对话唯一标识
	 * @returns 对话历史管理器
	 */
	getChatHistory(keyname: string) {
		return new DBChatHistory({
			keyname,
			dbService: this.dbService
		});
	}
}
