import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type { ConversationSendDto, MessageSendDto, UserInfoFromToken } from '@prisma-ai/shared';
import { RequireLogin, UserInfo } from '../../decorator';
import { AichatService } from './aichat.service';

@Controller('aichat')
export class AichatController {
	constructor(private readonly aichatService: AichatService) {}

	@Post()
	@RequireLogin()
	async sendMessageToAI(
		@Body() messageDto: MessageSendDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return await this.aichatService.sendMessageToAI(messageDto, userInfo);
	}

	/**
	 * 初始化项目的第一个空会话、更新已有的会话
	 */
	@Post('store')
	@RequireLogin()
	async storeConversation(
		@UserInfo() userInfo: UserInfoFromToken,
		@Body() conversationDto: ConversationSendDto
	) {
		return await this.aichatService.storeConversation(userInfo, conversationDto);
	}

	/**
	 * 给项目新建一个会话
	 */
	@Post('store-new')
	@RequireLogin()
	async storeNewConversation(
		@UserInfo() userInfo: UserInfoFromToken,
		@Body() conversationDto: ConversationSendDto
	) {
		return await this.aichatService.storeNewConversation(userInfo, conversationDto);
	}

	/**
	 * 获取某一项目经验下的对话历史列表
	 */
	@Get('/:project_id')
	@RequireLogin()
	async getConversationList(
		@UserInfo() userInfo: UserInfoFromToken,
		@Param('project_id') project_id: string
	) {
		return await this.aichatService.getConversationList(userInfo, project_id);
	}
}
