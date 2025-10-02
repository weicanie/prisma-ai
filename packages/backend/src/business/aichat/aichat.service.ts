import { Injectable, Logger } from '@nestjs/common';

import { ConversationDto, ConversationSendDto, UserInfoFromToken } from '@prisma-ai/shared';
import { AichatChainService } from '../../chain/aichat-chain.service';
import { ChainService } from '../../chain/chain.service';
import { BusinessEnum } from '../../chain/project-chain.service';
import { ProjectKonwbaseRetrieveService } from '../../chain/project-konwbase-retrieve.service';
import { DbService } from '../../DB/db.service';
import { ProjectService } from '../project/project.service';
import { UserMemoryService } from '../user-memory/user-memory.service';
import { MessageSendDto } from './dto/aichat-dto';

@Injectable()
export class AichatService {
	constructor(
		public dbService: DbService,
		public chainService: ChainService,
		public aichatChainService: AichatChainService,
		public projectKonwbaseRetrieveService: ProjectKonwbaseRetrieveService,
		public projectService: ProjectService,
		public userMemoryService: UserMemoryService
	) {}

	private logger = new Logger();

	async sendMessageToAI(messageDto: MessageSendDto, userInfo: UserInfoFromToken) {
		const { keyname, message, modelConfig, project_id } = messageDto;
		// 项目经验数据
		const project = await this.projectService.findProjectById(project_id, userInfo);
		// 项目经验相关文档
		const project_doc = await this.projectKonwbaseRetrieveService.retrievedDomainDocs(
			{
				project,
				userFeedback: { reflect: false, content: '' },
				userInfo
			},
			BusinessEnum.aichat
		);
		// 项目经验相关代码
		const project_code = await this.projectKonwbaseRetrieveService.retrievedProjectCodes(
			{
				project,
				userFeedback: { reflect: false, content: '' },
				userInfo
			},
			BusinessEnum.aichat
		);
		// 用户记忆
		const user_memory = await this.userMemoryService.getUserMemory(userInfo.userId);

		const userInput = message.content;

		const userInput_doc =
			await this.projectKonwbaseRetrieveService.retrievedDomainDocsFromUserInput(userInput, {
				project,
				userFeedback: { reflect: false, content: userInput },
				userInfo
			});

		const userInput_code =
			await this.projectKonwbaseRetrieveService.retrievedProjectCodesFromUserInput(userInput, {
				project,
				userFeedback: { reflect: false, content: '' },
				userInfo
			});

		const userInput_rag = `
		<用户输入>
		${userInput}
		</用户输入>
		<相关项目文档参考>
		${userInput_doc}
		</相关项目文档参考>
		<相关项目代码参考>
		${userInput_code}
		</相关项目代码参考>
		`;

		try {
			const chain = await this.aichatChainService.createChatChain(keyname, modelConfig, {
				project_data: `${JSON.stringify(project)}`,
				project_doc,
				project_code,
				user_memory: user_memory ? `${JSON.stringify(user_memory)}` : ''
			});
			const answer = await chain.invoke({ input: userInput_rag });
			return answer;
		} catch (error) {
			this.logger.error(error.stack);
			throw error;
		}
	}

	async storeConversation(userInfo: UserInfoFromToken, conversationDto: ConversationSendDto) {
		const { userId } = userInfo;
		const { keyname, label, content, project_id } = conversationDto;
		const values = await this.dbService.ai_conversation.findMany({
			where: {
				keyname: String(keyname),
				user_id: +userId,
				project_id: project_id
			}
		});

		// 用于初始化项目的第一个空会话
		if (!values[0]?.content && content.length === 0) {
			// 当项目已存在会话时，不新建会话
			const projectConversations = await this.dbService.ai_conversation.findMany({
				where: {
					project_id: conversationDto.project_id
				}
			});
			if (projectConversations.length > 0) return;

			return await this.dbService.ai_conversation.create({
				data: {
					keyname: String(keyname),
					label,
					content: JSON.stringify(content),
					user_id: +userId,
					project_id: project_id
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
					keyname: String(keyname),
					label,
					content: JSON.stringify(content),
					user_id: +userId,
					project_id: project_id
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
				project_id: project_id
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
				project_id: project_id
			}
		});
		values.forEach(v => {
			v.content = JSON.parse(v.content as string);
		});
		return values as unknown as ConversationDto[];
	}
}
