import { AIChatLLM } from '@prisma-ai/shared';
import { IsEnum, IsObject, IsString, MaxLength } from 'class-validator';

class ChatMessage {
	@MaxLength(1000)
	@IsString()
	id: string;

	@IsEnum(['user', 'assistant', 'system'])
	role: 'user' | 'assistant' | 'system';

	@MaxLength(100000)
	@IsString()
	content: string;

	@MaxLength(100000)
	@IsString()
	reasonContent: string;
}

class UserModelConfigDto {
	@IsEnum(AIChatLLM)
	llm_type: AIChatLLM;
}

export class MessageSendDto {
	@IsObject()
	message: ChatMessage;

	@IsString()
	@MaxLength(1000)
	keyname: string;

	@IsObject()
	modelConfig: UserModelConfigDto;

	@IsString()
	@MaxLength(255)
	project_id: string;
}
