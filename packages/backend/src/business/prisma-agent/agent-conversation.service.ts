import { Injectable } from '@nestjs/common';
import { ConversationDto, ConversationSendDto, UserInfoFromToken, Who } from '@prisma-ai/shared';
import { DbService } from '../../DB/db.service';

@Injectable()
export class AgentConversationService {
	who = Who.agent;
	constructor(public dbService: DbService) {}

	async storeConversation(userInfo: UserInfoFromToken, conversationDto: ConversationSendDto) {
		const { userId } = userInfo;
		const { keyname, label, content, project_id } = conversationDto;
		const values = await this.dbService.ai_conversation.findMany({
			where: {
				keyname: String(keyname),
				user_id: +userId,
				project_id: project_id,
				who: this.who
			}
		});

		// 用于初始化项目的第一个空会话
		if (!values[0]?.content && content.length === 0) {
			// 当项目已存在会话时，不新建会话
			const projectConversations = await this.dbService.ai_conversation.findMany({
				where: {
					project_id: conversationDto.project_id,
					who: this.who
				}
			});
			if (projectConversations.length > 0) return;

			return await this.dbService.ai_conversation.create({
				data: {
					keyname: String(keyname),
					label,
					content: JSON.stringify(content),
					user_id: +userId,
					project_id: project_id,
					who: this.who
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
					keyname: String(keyname),
					user_id: +userId,
					project_id: project_id,
					who: this.who
				},
				data: {
					content: JSON.stringify(content)
				}
			});
		} else {
			//新增
			return await this.dbService.ai_conversation.create({
				data: {
					keyname: String(keyname),
					label,
					content: JSON.stringify(content),
					user_id: +userId,
					project_id: project_id,
					who: this.who
				}
			});
		}
	}

	async storeNewConversation(userInfo: UserInfoFromToken, conversationDto: ConversationSendDto) {
		const { userId } = userInfo;
		const { keyname, label, content, project_id } = conversationDto;

		return await this.dbService.ai_conversation.create({
			data: {
				keyname: String(keyname),
				label,
				content: JSON.stringify(content),
				user_id: +userId,
				project_id: project_id,
				who: this.who
			}
		});
	}

	async getConversationList(
		userInfo: UserInfoFromToken,
		project_id: string
	): Promise<ConversationDto[]> {
		const { userId } = userInfo;
		const values = await this.dbService.ai_conversation.findMany({
			where: {
				user_id: +userId,
				project_id: project_id,
				who: this.who
			}
		});
		values.forEach(v => {
			v.content = JSON.parse(v.content as string);
		});
		return values as unknown as ConversationDto[];
	}
}
