import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConversationSendDto, MessageSendDto, UserInfoFromToken } from '@prisma-ai/shared';
import { RequireLogin, UserInfo } from '../../decorator';
import { AichatService } from './aichat.service';

@Controller('aichat')
export class AichatController {
	constructor(private readonly aichatService: AichatService) {}

	@Post()
	async sendMessageToAI(@Body() messageDto: MessageSendDto) {
		const { message } = messageDto;
		return await this.aichatService.sendMessageToAI(message);
	}

	@Post('store')
	@RequireLogin()
	async storeConversation(
		@UserInfo() userInfo: UserInfoFromToken,
		@Body() conversationDto: ConversationSendDto
	) {
		return await this.aichatService.storeConversation(userInfo, conversationDto);
	}

	@Get()
	@RequireLogin()
	async getConversationList(@UserInfo() userInfo: UserInfoFromToken) {
		return await this.aichatService.getConversationList(userInfo);
	}
}
