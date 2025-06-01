//从文件中读取prompt
import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export enum role {
	SYSTEM = 'system',
	ASSISTANT = 'assistant',
	HUMAN = 'human',
	PLACEHOLDER = 'placeholder'
}

@Injectable()
export class PromptService {
	/**
	 * prompt插槽: instructions
	 */
	private readonly polishT: string;
	private readonly mineFewShot: string;
	/**
	 * prompt插槽: fewShot、instructions
	 */
	private readonly mineT: PromptTemplate;
	constructor() {
		const polishStr = fs.readFileSync(
			path.join(process.cwd(), 'ai_data/prompt/project_frontend/polish-T.md'),
			{
				encoding: 'utf-8'
			}
		);
		const mineTStr = fs.readFileSync(
			path.join(process.cwd(), 'ai_data/prompt/project_frontend/mine-T.md'),
			{
				encoding: 'utf-8'
			}
		);

		this.polishT = polishStr;
		this.mineT = PromptTemplate.fromTemplate(mineTStr);

		this.mineFewShot = fs.readFileSync(
			path.join(process.cwd(), 'ai_data/prompt/project_frontend/mine-fewshot.md'),
			{
				encoding: 'utf-8'
			}
		);
	}

	/**
	 * 返回的prompt插槽：{instructions}、{chat_history}、{input}
	 */
	async minePrompt() {
		const mine = await this.mineT.format({ fewShot: this.mineFewShot });

		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, mine],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);

		return prompt;
	}

	/**
	 * @return prompt：{instructions}、{chat_history}、{input}
	 */
	async polishPrompt(x) {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.polishT],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);
		return prompt;
	}
}
