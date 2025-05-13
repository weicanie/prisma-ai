import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableLambda, RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import type { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BufferMemory } from 'langchain/memory';
import { Model } from 'mongoose';
import { z } from 'zod';
import { ModelService } from '../model/model.service';
import { PromptService, role } from '../prompt/prompt.service';
import {
	ProjectExperience,
	projectMinedSchema,
	projectPolishedSchema,
	projectSchema
} from '../types/project';
import { Project } from './entities/project.entities';

@Injectable()
export class ChainService {
	@InjectModel(Project.name)
	private projectModel: Model<Project>;

	constructor(
		public modelService: ModelService,
		public promptService: PromptService
	) {}

	/**
	 * 创建链, memory默认使用BufferMemory, memory是否注入prompt取决于prompt是否提供{chat_history}插槽
	 * @description chat_record -> memory -> chat_history -> prompt -> llm
	 * @param llm 模型实例
	 * @param prompt 输入模型的整个prompt
	 * @param schema 定义模型输出格式的zod schema
	 * @param saveFn 结果保存函数,保存到mongodb数据库
	 */
	private async createChain(
		llm: ChatOpenAI,
		prompt: ChatPromptTemplate,
		schema: z.Schema,
		saveFn?: (...args: any) => any
	) {
		const outputParser = StructuredOutputParser.fromZodSchema(schema);

		const memory = new BufferMemory({
			chatHistory: this.modelService.getChatHistory(`${new Date().toLocaleDateString()}`)
		});

		let userInput = '';
		const chain = RunnableSequence.from([
			{
				input: input => {
					userInput = input;
					return input;
				},
				chat_history: async (input: any, options: any) => {
					const vars = await memory.loadMemoryVariables({ input }); //EntityMemory需要传入input
					// console.log('聊天历史记忆:', vars.history || vars.summary || '聊天历史为空~');
					return vars.history || vars.summary || '';
				},
				instructions: async () => {
					return outputParser.getFormatInstructions();
				}
			},
			new RunnablePassthrough({
				func: async (input: any, options: any) => {
					// console.log('模型输入', input);
				}
			}),
			prompt,
			llm,
			new RunnablePassthrough({
				func: async (input: any, options: any) => {
					// console.log('模型输出', input);
				}
			}),
			outputParser,
			RunnableLambda.from(async input => {
				await memory.saveContext({ input: userInput }, { output: input });
				// console.log('格式化后的模型输出', input);
				return input;
			}),
			RunnableLambda.from(saveFn ? saveFn.bind(this) : () => {})
		]);

		return chain;
	}

	/**
	 * 输入的文本项目经验（单个）转化为JSON
	 * @description 1、用户导入现有的项目经验,则通过llm转为JSON
	 * @description 2、用户以表单提交项目经验,则直接就是JSON
	 */
	async tansformChain() {
		const schema = projectSchema;
		const outputParser = StructuredOutputParser.fromZodSchema(schema);
		const prompt = ChatPromptTemplate.fromMessages([
			[
				`${role.SYSTEM}`,
				`将用户输入的项目经验描述按指定格式输出。
				如果信息缺失,就留空。注意不要修改任何信息。
				你需要对亮点进行分类,但不要修改亮点的任何信息。
				格式说明:${outputParser.getFormatInstructions()}`
			],
			[`${role.HUMAN}`, '{input}']
		]);

		const llm = await this.modelService.getLLMDeepSeekRaw();

		async function saveProject(this: ChainService, project: ProjectExperience) {
			//增
			const project_model = new this.projectModel(project);
			await project_model.save();
			return project;
		}

		const chain = await this.createChain(llm, prompt, schema, saveProject);
		return chain;
	}

	/**
	 * 现有亮点评估、改进。
	 * @description -> 亮点突出
	 */
	async polishChain(project: ProjectExperience) {
		const schema = projectPolishedSchema;
		const outputParser = StructuredOutputParser.fromZodSchema(schema);
		const prompt = await this.promptService.polishPrompt(outputParser.getFormatInstructions());

		const llm = await this.modelService.getLLMDeepSeekRaw();

		const chain = await this.createChain(llm, prompt, schema);
		return chain;
	}

	/**
	 * 项目亮点挖掘。
	 * @description -> 亮点充足
	 */
	async mineChain(project: ProjectExperience) {
		const schema = projectMinedSchema;
		const outputParser = StructuredOutputParser.fromZodSchema(schema);
		const prompt = await this.promptService.polishPrompt(outputParser.getFormatInstructions());

		const llm = await this.modelService.getLLMDeepSeekRaw();

		const chain = await this.createChain(llm, prompt, schema);
		return chain;
	}
}
