import { Injectable, Logger } from '@nestjs/common';

import {
	ChatMessage,
	ConversationDto,
	ConversationSendDto,
	UserInfoFromToken
} from '@prism-ai/shared';
import { AichatChainService } from '../../chain/aichat-chain.service';
import { ChainService } from '../../chain/chain.service';
import { DbService } from '../../DB/db.service';

@Injectable()
export class AichatService {
	constructor(
		public dbService: DbService,
		public chainService: ChainService,
		public aichatChainService: AichatChainService
	) {}

	private logger = new Logger();

	async sendMessageToAI(message: ChatMessage) {
		try {
			const chain = await this.aichatChainService.createChatChain();
			const answer = await chain.invoke({ input: message.content });
			return answer;
		} catch (error) {
			this.logger.error(error, 'AichatService', 'sendMessageToAI');
			throw error;
		}
	}

	async storeConversation(userInfo: UserInfoFromToken, conversationDto: ConversationSendDto) {
		const { userId } = userInfo;
		const { key, label } = conversationDto;
		const content = conversationDto.content;
		const values = await this.dbService.ai_conversation.findMany({
			where: {
				keyname: String(key),
				user_id: +userId
			}
		});

		// 初始化空会话
		if (!values[0]?.content && content.length === 0) {
			return await this.dbService.ai_conversation.create({
				data: {
					keyname: String(key),
					label,
					content: JSON.stringify(content),
					user_id: +userId
				}
			});
		}
		// 非初始化空对话
		if (content.length === 0) {
			return '空对话,已忽略';
		}
		//判断会话数据是否已存在
		if (values[0]?.content) {
			//更新
			return await this.dbService.ai_conversation.updateMany({
				where: {
					keyname: String(key),
					user_id: +userId
				},
				data: {
					content: JSON.stringify(content)
				}
			});
		} else {
			//新增
			return await this.dbService.ai_conversation.create({
				data: {
					keyname: String(key),
					label,
					content: JSON.stringify(content),
					user_id: +userId
				}
			});
		}
	}

	async getConversationList(userInfo: UserInfoFromToken): Promise<ConversationDto[]> {
		const { userId } = userInfo;
		const values = await this.dbService.ai_conversation.findMany({
			where: {
				user_id: +userId
			}
		});
		values.forEach(v => {
			v.content = JSON.parse(v.content as string);
		});
		return values as unknown as ConversationDto[];
	}
}
