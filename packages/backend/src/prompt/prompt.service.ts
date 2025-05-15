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
	private readonly polishT: PromptTemplate;
	private readonly mineFewShot: string;
	/**
	 * prompt插槽: fewShot、instructions
	 */
	private readonly mineT: PromptTemplate;
	constructor() {
		const polishStr = fs.readFileSync(
			path.join(process.cwd(), 'data/prompt/project_frontend/polish-T.md'),
			{
				encoding: 'utf-8'
			}
		);
		const mineTStr = fs.readFileSync(
			path.join(process.cwd(), 'data/prompt/project_frontend/mine-T.md'),
			{
				encoding: 'utf-8'
			}
		);

		this.polishT = PromptTemplate.fromTemplate(polishStr);
		this.mineT = PromptTemplate.fromTemplate(mineTStr);

		this.mineFewShot = fs.readFileSync(
			path.join(process.cwd(), 'data/prompt/project_frontend/mine-fewshot.md'),
			{
				encoding: 'utf-8'
			}
		);
	}

	/**
	 * 返回的prompt插槽：{chat_history}、{input}
	 */
	async minePrompt(instructions = '') {
		const mine = await this.mineT.format({ fewShot: this.mineFewShot, instructions });

		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, mine],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);

		return prompt;
	}

	/**
	 * @param instructions 输出格式说明
	 * @return prompt：{chat_history}、{input}
	 */
	async polishPrompt(instructions = '') {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, await this.polishT.format({ instructions })],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);
		return prompt;
	}
}
