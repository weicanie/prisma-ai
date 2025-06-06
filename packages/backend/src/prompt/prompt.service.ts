//从文件中读取prompt
import { ChatPromptTemplate } from '@langchain/core/prompts';
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
	private readonly lookupT: string;

	/**
	 * prompt插槽: fewShot、instructions
	 */
	private mineT: string;

	private readonly fewShowMap: Record<string, string> = {};

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
		const lookupTStr = fs.readFileSync(
			path.join(process.cwd(), 'ai_data/prompt/project_frontend/lookup-T.md'),
			{
				encoding: 'utf-8'
			}
		);

		this.polishT = polishStr;
		this.lookupT = lookupTStr;
		this.mineT = mineTStr;
		const mineFewShot = fs.readFileSync(
			path.join(process.cwd(), 'ai_data/prompt/project_frontend/mine-fewshot.md'),
			{
				encoding: 'utf-8'
			}
		);
		this.fewShowMap['mine'] = mineFewShot;
	}

	/**
	 * 返回的prompt插槽：{instructions}、{instructions0}、{chat_history}、{input}
	 */
	async minePrompt() {
		//FIXME 按理说不该如此,应该是哪儿没设计好
		this.mineT = this.mineT.replace('{fewShot}', this.fewShowMap['mine']);

		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.mineT],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);

		return prompt;
	}
	async fewShot(key = 'mine') {
		return this.fewShowMap[key] ?? '';
	}

	/**
	 * @return prompt：{instructions}、{instructions0}、{chat_history}、{input}
	 */
	async polishPrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.polishT],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);
		return prompt;
	}
	/**
	 * @return prompt：{instructions}、{chat_history}、{input}
	 */
	async lookupPrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.lookupT],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);
		return prompt;
	}
}
