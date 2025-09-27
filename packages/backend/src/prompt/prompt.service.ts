//从文件中读取prompt
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export enum role {
	SYSTEM = 'system',
	ASSISTANT = 'assistant',
	HUMAN = 'human',
	PLACEHOLDER = 'placeholder'
}

@Injectable()
export class PromptService implements OnModuleInit {
	private polishT: string;
	private lookupT: string;
	private businessLookupT: string;
	private businessPaperT: string;
	private matchT: string;
	private hjmRerankT: string;
	private hjmTransformT: string;
	private diffLearnT: string;
	private textToJsonT: string;
	private resultsToTextT: string;
	private mineT: string;
	private interviewSummaryGenerateT: string;
	private interviewSummaryTransformT: string;
	private generateMindmapP: string;
	private generateMindmapT: string;
	private readonly fewShotMap: Record<string, string> = {};

	constructor() {}

	async onModuleInit() {
		try {
			const promises = [
				this._readPromptFile(path.join(process.cwd(), 'data/prompt/project_process/polish-T.md')),
				this._readPromptFile(path.join(process.cwd(), 'data/prompt/project_process/mine-T.md')),
				this._readPromptFile(path.join(process.cwd(), 'data/prompt/project_process/lookup-T.md')),
				this._readPromptFile(
					path.join(process.cwd(), 'data/prompt/project_process/business-lookup-T.md')
				),
				this._readPromptFile(
					path.join(process.cwd(), 'data/prompt/project_process/business-paper-T.md')
				),
				this._readPromptFile(
					path.join(process.cwd(), 'data/prompt/project_process/mine-fewshot.md')
				),
				this._readPromptFile(path.join(process.cwd(), 'data/prompt/hjm/match-T.md')),
				this._readPromptFile(path.join(process.cwd(), 'data/prompt/hjm/hjm_rerank-T.md')),
				this._readPromptFile(path.join(process.cwd(), 'data/prompt/hjm/hjm_transform-T.md')),
				this._readPromptFile(path.join(process.cwd(), 'data/prompt/learn/diff_learn-T.md')),
				this._readPromptFile(path.join(process.cwd(), 'data/prompt/unuse/text_to_json.md')),
				this._readPromptFile(path.join(process.cwd(), 'data/prompt/unuse/results_to_text.md')),
				this._readPromptFile(path.join(process.cwd(), 'data/prompt/interview-summary/generate.md')),
				this._readPromptFile(
					path.join(process.cwd(), 'data/prompt/interview-summary/transform.md')
				),
				this._readPromptFile(
					path.join(process.cwd(), 'data/prompt/interview-summary/generate_mindmap.md')
				),
				this._readPromptFile(path.join(process.cwd(), 'data/prompt/question/generate_mindmap.md'))
			];
			const [
				polishT,
				mineT,
				lookupT,
				businessLookupT,
				businessPaperT,
				mineFewShot,
				matchT,
				hjmRerankT,
				hjmTransformT,
				diffLearnT,
				textToJsonT,
				resultsToTextT,
				interviewSummaryGenerateT,
				interviewSummaryTransformT,
				generateMindmapP,
				generateMindmapT
			] = await Promise.all(promises);
			this.polishT = polishT as string;
			this.mineT = mineT as string;
			this.lookupT = lookupT as string;
			this.businessLookupT = businessLookupT as string;
			this.businessPaperT = businessPaperT as string;
			this.matchT = matchT as string;
			this.hjmRerankT = hjmRerankT as string;
			this.hjmTransformT = hjmTransformT as string;
			this.diffLearnT = diffLearnT as string;
			this.textToJsonT = textToJsonT as string;
			this.resultsToTextT = resultsToTextT as string;
			this.interviewSummaryGenerateT = interviewSummaryGenerateT as string;
			this.interviewSummaryTransformT = interviewSummaryTransformT as string;
			this.generateMindmapT = generateMindmapT as string;
			this.generateMindmapP = generateMindmapP as string;
			this.fewShotMap['mine'] = mineFewShot as string;
		} catch (error) {
			console.error('Failed to read prompt files', error);
		}
	}

	private async _readPromptFile(filePath: string) {
		return new Promise((resolve, reject) => {
			fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
				if (err) reject(err);
				else resolve(data);
			});
		});
	}

	/**
	 * 部分填充promptT字符串的插槽
	 * @description 由于langchain的partial方法不支持PromptTemplate部分填充后作为ChatPromptTemplate的组成部分,因此使用带插槽的string传入ChatPromptTemplate
	 * @description 这些插槽最终都生效,因为chain中的Runnable prompt中所有的{..}都会成为待填充的变量
	 * @param stringT
	 * @param param1
	 * @returns 填充后的promptT字符串
	 */
	public partialT(stringT: string, [slotName, contentP]: [string, string]) {
		if (!stringT.includes(slotName)) {
			console.error(`所要填充的prompt模板字符串不具有插槽:${slotName},将不填充直接输出`);
			return stringT;
		}
		stringT = stringT.replace(slotName, contentP);
		return stringT;
	}
	/**
	 * 对项目经验进行亮点挖掘的prompt
	 *
	 */
	async minePrompt(partial: { userSkills: string }) {
		this.mineT = this.partialT(this.mineT, ['{fewShot}', this.fewShotMap['mine']]);

		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.partialT(this.mineT, ['{userSkills}', partial.userSkills])],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);

		return prompt;
	}
	async fewShot(key = 'mine') {
		return this.fewShotMap[key] ?? '';
	}

	/**
	 * 在项目经验的分析结果的基础上对项目经验进行优化的prompt
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
	 * 对项目经验进行分析的prompt
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
	/**
	 * 对项目经验进行业务分析的prompt
	 *
	 */
	async businessLookupPrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.businessLookupT],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);
		return prompt;
	}
	/**
	 * 生成项目经验面试材料的prompt
	 *
	 */
	async businessPaperPrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.businessPaperT],
			[`${role.HUMAN}`, '{input}']
		]);
		return prompt;
	}
	/**
	 * 将简历转化为岗位定制简历的prompt
	 */
	async matchPrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.matchT],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);
		return prompt;
	}
	/**
	 * 对召回的岗位信息进行重排、分析的prompt
	 */
	async hjmRerankPrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.hjmRerankT],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);
		return prompt;
	}
	/**
	 * 将简历转化为岗位描述的prompt
	 */
	async hjmTransformPrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.hjmTransformT],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);
		return prompt;
	}

	/**
	 * 对简历原始版本、当前版本进行diff分析出学习路线的prompt
	 */
	async diffLearnPrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.diffLearnT],
			// [`${role.SYSTEM}`, `这是目前为止的聊天记录：{chat_history}`],
			[`${role.HUMAN}`, '{input}']
		]);
		return prompt;
	}

	/**
	 * 将文本转换为JSON的prompt
	 */
	async textToJsonPrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.textToJsonT],
			[`${role.HUMAN}`, '{input}']
		]);
		return prompt;
	}

	/**
	 * 将所有分析结果整合为一份报告的prompt
	 */
	async resultsToTextPrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.resultsToTextT],
			[`${role.HUMAN}`, '{input}']
		]);
		return prompt;
	}

	/**
	 * 从面经中生成问题清单的prompt
	 */
	async interviewSummaryGeneratePrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.interviewSummaryGenerateT],
			[`${role.HUMAN}`, '面经：{input}']
		]);
		return prompt;
	}

	/**
	 * 将问题清单中的问题转换为结构化面试题的prompt
	 */
	async interviewSummaryTransformPrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[
				`${role.SYSTEM}`,
				this.partialT(this.interviewSummaryTransformT, [
					'{generate_mindmap}',
					this.generateMindmapP
				])
			],
			[`${role.HUMAN}`, '问题清单：{input}']
		]);
		return prompt;
	}

	/**
	 * 生成思维导图md的prompt
	 */
	async generateMindmapPrompt() {
		const prompt = ChatPromptTemplate.fromMessages([
			[`${role.SYSTEM}`, this.generateMindmapT],
			[
				`${role.HUMAN}`,
				`请为以下面试题数据生成思维导图的Markdown文本。
\`\`\`json
{questions}
\`\`\``
			]
		]);
		return prompt;
	}
}
