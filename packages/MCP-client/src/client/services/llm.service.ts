import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { OpenAITool } from '../types';
import { addLogs, logType } from '../utils/log.util';

@Injectable()
export class LLMService {
	private openai: OpenAI;
	private model: string;

	constructor(apiKey: string, model: string = 'gpt-3.5-turbo', baseURL: string = '') {
		this.openai = new OpenAI({
			baseURL,
			apiKey
		});
		this.model = model;
	}

	async sendMessage(messages: Array<OpenAI.Chat.ChatCompletionMessageParam>, tools?: OpenAITool[]) {
		try {
			addLogs(
				{
					model: this.model,
					messages,
					tools: tools?.length > 0 ? tools : undefined,
					tool_choice: tools?.length > 0 ? 'auto' : undefined
				},
				logType.LLMRequest
			);

			const result = await this.openai.chat.completions.create({
				model: this.model,
				messages,
				tools: tools?.length > 0 ? tools : undefined,
				tool_choice: tools?.length > 0 ? 'auto' : undefined
			});

			addLogs(result, logType.LLMResponse);
			return result;
		} catch (error) {
			addLogs(error, logType.LLMError);
			throw new Error(
				`发送消息到LLM失败: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	getModel(): string {
		return this.model;
	}

	setModel(model: string): void {
		this.model = model;
	}
	getApiKey() {
		return process.env.OPENAI_API_KEY || '';
	}
	getBaseURL() {
		return process.env.BASE_URL || '';
	}
}
