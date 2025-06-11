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
	private readonly matchT: string;
	private readonly hjmRerankT: string;

	/**
	 * prompt插槽: fewShot、instructions
	 */
	private mineT: string;

	/**
	 * key -> 示例prompt
	 */
	private readonly fewShotMap: Record<string, string> = {};

	constructor() {
		const polishStr = fs.readFileSync(path.join(process.cwd(), 'ai_data/prompt/polish-T.md'), {
			encoding: 'utf-8'
		});
		const mineTStr = fs.readFileSync(path.join(process.cwd(), 'ai_data/prompt/mine-T.md'), {
			encoding: 'utf-8'
		});
		const lookupTStr = fs.readFileSync(path.join(process.cwd(), 'ai_data/prompt/lookup-T.md'), {
			encoding: 'utf-8'
		});
		const matchTStr = fs.readFileSync(path.join(process.cwd(), 'ai_data/prompt/match-T.md'), {
			encoding: 'utf-8'
		});
		const hjmRerankTStr = fs.readFileSync(
			path.join(process.cwd(), 'ai_data/prompt/hjm_rerank-T.md'),
			{
				encoding: 'utf-8'
			}
		);

		this.polishT = polishStr;
		this.lookupT = lookupTStr;
		this.mineT = mineTStr;
		this.matchT = matchTStr;
		this.hjmRerankT = hjmRerankTStr;
		const mineFewShot = fs.readFileSync(
			path.join(process.cwd(), 'ai_data/prompt/mine-fewshot.md'),
			{
				encoding: 'utf-8'
			}
		);
		this.fewShotMap['mine'] = mineFewShot;
	}
	/**
	 * 部分填充promptT字符串的插槽
	 * @description 由于langchain的partial方法不支持PromptTemplate部分填充后作为ChatPromptTemplate的组成部分,因此使用带插槽的string传入ChatPromptTemplate
	 * @description 这些插槽最终都生效,因为chain中的Runnable prompt中所有的{..}都会成为待填充的变量
	 * @param stringT
	 * @param param1
	 * @returns 填充后的promptT字符串
	 */
	private partialT(stringT: string, [slotName, contentP]: [string, string]) {
		if (!stringT.includes(slotName)) {
			console.error(`所要填充的prompt模板字符串不具有插槽:${slotName},将不填充直接输出`);
			return stringT;
		}
		stringT = stringT.replace(slotName, contentP);
		return stringT;
	}
	/**
	 * 返回的prompt待填充的插槽：{instructions}、{instructions0}、{chat_history}、{input}
	 *
	 */
	async minePrompt() {
		this.mineT = this.partialT(this.mineT, ['{fewShot}', this.fewShotMap['mine']]);

		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.mineT],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);

		return prompt;
	}
	async fewShot(key = 'mine') {
		return this.fewShotMap[key] ?? '';
	}

	/**
	 * @return prompt：{instructions}、{instructions0}、{chat_history}、{input}
	 *
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
	 * @return prompt：{instructions}、{instructions0}、{chat_history}、{input}
	 *
	 */
	async lookupPrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.lookupT],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);
		return prompt;
	}

	async matchPrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.matchT],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);
		return prompt;
	}
	/**
	 * @return prompt：{input}
	 *
	 */
	async hjmRerankPrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.hjmRerankT]
			// human role 的 {input} 由 chain service 传入
		]);
		return prompt;
	}
}
