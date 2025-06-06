import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';
import { ChatDeepSeek } from '@langchain/deepseek';
import type { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	lookupResultSchema,
	ProjectMinedDto,
	projectMinedSchema,
	ProjectPolishedDto,
	projectPolishedSchema,
	projectSchema
} from '@prism-ai/shared';
import { BufferMemory } from 'langchain/memory';
import * as path from 'path';
import { z } from 'zod';
import { AgentService } from '../agent/agent.service';
import { MCPClientService } from '../mcp-client/mcp-client.service';
import { ModelService } from '../model/model.service';
import { PromptService, role } from '../prompt/prompt.service';

@Injectable()
export class ChainService {
	constructor(
		public modelService: ModelService,
		public promptService: PromptService,
		private agentService: AgentService,
		public clientService: MCPClientService,
		public configService: ConfigService
	) {}

	/**
	 * 创建链, memory默认使用BufferMemory, memory是否注入prompt取决于prompt是否提供{chat_history}插槽
	 * @description chat_record -> memory -> chat_history -> prompt -> llm
	 * @param llm 模型实例
	 * @param prompt 输入模型的整个prompt
	 * @param schema 定义模型输出格式的zod schema
	 * @param saveFn 结果保存函数,保存到mongodb数据库
	 */
	private async createChain<Input = string, Output = unknown>(
		llm: ChatOpenAI | ChatDeepSeek,
		prompt: ChatPromptTemplate,
		outputSchema: z.Schema,
		inputSchema?: z.Schema
	): Promise<RunnableSequence<Input, Output>> {
		const outputParser = StructuredOutputParser.fromZodSchema(outputSchema);

		const memory = new BufferMemory({
			chatHistory: this.modelService.getChatHistory(
				`${new Date().toLocaleDateString().replace(/\//g, '-')}`
			)
		});

		let userInput = '';
		const chain = RunnableSequence.from<Input, Output>([
			{
				input: input => {
					userInput = input as string;
					return input;
				},
				chat_history: async (input: any, options: any) => {
					const vars = await memory.loadMemoryVariables({ input }); //EntityMemory需要传入input
					return vars.history || vars.summary || '';
				},
				instructions: async () => {
					return outputParser.getFormatInstructions();
				},
				/* 当输出包含输入格式的输出数据时,需要向模型指定 */
				instructions0: async () => {
					const outputParser = inputSchema && StructuredOutputParser.fromZodSchema(inputSchema);
					return outputParser && outputParser.getFormatInstructions();
				}
			},
			prompt,
			llm,
			outputParser,
			RunnableLambda.from(async input => {
				await memory.saveContext({ input: userInput }, { output: input });
				return input;
			})
		]);

		return chain;
	}

	/**
	 * 创建流式链（不包含保存逻辑）
	 */
	private async createStreamChain<Input = string>(
		llm: ChatOpenAI | ChatDeepSeek,
		prompt: ChatPromptTemplate,
		outputSchema: z.Schema,
		inputSchema?: z.Schema
	): Promise<RunnableSequence<Input, any>> {
		const memory = new BufferMemory({
			chatHistory: this.modelService.getChatHistory(
				`${new Date().toLocaleDateString().replace(/\//g, '-')}`
			)
		});

		const chain = RunnableSequence.from<Input, any>([
			{
				input: input => input,
				chat_history: async (input: any) => {
					const vars = await memory.loadMemoryVariables({ input });
					return vars.history || vars.summary || '';
				},
				instructions: async () => {
					const outputParser = StructuredOutputParser.fromZodSchema(outputSchema);
					const a = outputParser.getFormatInstructions();
					console.log('🚀 ~ instructions: ~ a:', a);
					return a;
				},
				/* 当输出包含输入格式的输出数据时,需要向模型指定 */
				instructions0: async () => {
					const outputParser = inputSchema && StructuredOutputParser.fromZodSchema(inputSchema);
					return outputParser && outputParser.getFormatInstructions();
				}
			},
			prompt,
			llm
			// 不添加会阻截流式输出的Runnable
		]);

		return chain;
	}

	/**
	 * 输入的文本项目经验（单个）转化为JSON
	 * @description 1、用户导入现有的项目经验,则通过llm转为JSON
	 * @description 2、用户以表单提交项目经验,则直接就是JSON
	 */
	async tansformChain() {
		const outputParser = StructuredOutputParser.fromZodSchema(projectSchema);
		const prompt = ChatPromptTemplate.fromMessages([
			[
				`${role.SYSTEM}`,
				`
				将用户输入的项目经验描述按指定格式输出。
				如果信息缺失,就留空。
				注意不要修改任何信息。
				你需要对亮点进行分类,但不要修改亮点的任何信息。
				格式说明:{instructions}` // 内部的prompt会教JSON schema、给输入的JSON schema给llm
			],
			[`${role.HUMAN}`, '{input}']
		]);

		const llm = await this.modelService.getLLMDeepSeekRaw('deepseek-chat');
		const chain = RunnableSequence.from<{ input: string }, z.infer<typeof projectSchema>>([
			{
				input: input => input.input,
				instructions: () => outputParser.getFormatInstructions()
			},
			prompt,
			llm,
			outputParser
		]);
		return chain;
	}

	/**
	 * 格式修复：按schema指定的格式将原输入输出
	 * @param schema zod schema
	 * @param input 原输入
	 * @param errMsg 格式错误信息
	 * @returns
	 */
	async fomartFixChain<T = any>(schema: z.Schema, errMsg: string) {
		const llm = this.modelService.getLLMDeepSeekRaw('deepseek-chat');
		const outputParser = StructuredOutputParser.fromZodSchema(schema);
		const prompt = ChatPromptTemplate.fromMessages([
			[
				`${role.SYSTEM}`,
				`
				用户将输入格式错误的项目经验描述。
				根据以下格式说明和错误信息修复格式错误。
				注意不要修改任何信息。
				格式说明:{instructions}
				错误信息:{errMsg}
				`
			],
			[`${role.HUMAN}`, '{input}']
		]);
		const chain = RunnableSequence.from<{ input: string }, T>([
			{
				input: input => input.input,
				instructions: () => outputParser.getFormatInstructions(),
				errMsg: () => errMsg
			},
			prompt,
			llm,
			outputParser
		]);
		return chain;
	}

	/**
	 * 现有亮点评估、改进。
	 * @description -> 亮点突出
	 */
	async polishChain(stream = false) {
		const schema = projectPolishedSchema;
		const schema0 = projectSchema; // 输入的schema
		const outputParser = StructuredOutputParser.fromZodSchema(schema);
		const prompt = await this.promptService.polishPrompt();

		const llm = await this.modelService.getLLMDeepSeekRaw('deepseek-reasoner');

		const chain = await this.createChain<string, ProjectPolishedDto>(llm, prompt, schema, schema0);
		const streamChain = await this.createStreamChain<string>(llm, prompt, schema, schema0);
		if (stream) {
			return streamChain;
		}
		return chain;
	}

	/**
	 * 项目亮点挖掘。
	 * @description -> 亮点充足
	 */
	async mineChain(stream = false) {
		const schema = projectMinedSchema;
		const schema0 = projectSchema; // 输入的schema

		const outputParser = StructuredOutputParser.fromZodSchema(schema);
		const prompt = await this.promptService.minePrompt();

		const llm = await this.modelService.getLLMDeepSeekRaw('deepseek-reasoner');

		const chain = await this.createChain<string, ProjectMinedDto>(llm, prompt, schema, schema0);
		const streamChain = await this.createStreamChain<string>(llm, prompt, schema, schema0);
		if (stream) {
			return streamChain;
		}
		return chain;
	}

	/**
	 * 分析项目经验的问题和解决方案
	 */
	async lookupChain(stream = false) {
		const schema = lookupResultSchema;
		const prompt = await this.promptService.lookupPrompt();

		const llm = await this.modelService.getLLMDeepSeekRaw('deepseek-reasoner');

		const chain = await this.createChain<string, ProjectMinedDto>(llm, prompt, schema);
		const streamChain = await this.createStreamChain<string>(llm, prompt, schema);
		if (stream) {
			return streamChain;
		}
		return chain;
	}

	/**
	 * 通过agent和mcp查询本地mongodb数据库
	 * @param query 用户输入的查询语句
	 */
	async queryChain() {
		try {
			const llm = await this.modelService.getLLMDeepSeekRaw('deepseek-reasoner');
			// const llm = await this.modelService.getLLMOpenAIRaw();

			const client = await this.clientService.connectToServerLocal(
				'mongodb',
				path.join(process.cwd(), './mcp-servers.json')
			);

			const tools = await this.clientService.getTools(client);

			// 添加项目表结构信息到系统提示中
			const prompt = ChatPromptTemplate.fromMessages([
				[
					`${role.SYSTEM}`,
					`你是一个智能助手，可以帮助用户查询项目数据库。
数据库中的projects集合字段举例说明如下：
{{
  "info": {{
    "name": "Ul 组件库",
    "desc": {{
      "role": "负责组件架构设计、核心功能开发及质量保障工作，主导技术选型与工程化建设",
      "contribute": "独立开发20+个基础组件，实现Monorepo多包管理架构，建立完整的代码规范体系与自动化测试方案",
      "bgAndTarget": "构建企业级UI组件库以统一产品设计语言，提供可复用的前端组件资产，提升跨团队协作效率",
      "_id": {{
        "$oid": "681b16119199e6ef8f1952d1"
				}}
    }},
    "techStack": [
      "React",
      "Sass",
      "Axios",
      "TypeScript",
      "StoryBook",
      "Testing Library"
    ],
    "_id": {{
      "$oid": "681b16119199e6ef8f1952d0"
    }}
}}
使用提供的工具来查询数据库。`
				], //优化：在system prompt里将表结构信息，和更明确的要求告诉模型（固定任务不应该让llm自己推理太多）
				[`${role.PLACEHOLDER}`, `{chat_history}`],
				[`${role.HUMAN}`, '{input}'],
				[`${role.PLACEHOLDER}`, `{agent_scratchpad}`]
			]);

			const agent = await this.agentService.createOpenAIToolsAgent(llm, client, tools, prompt);

			const memory = new BufferMemory({
				chatHistory: this.modelService.getChatHistory(
					`${new Date().toLocaleDateString().replace(/\//g, '-')}`
				)
			});

			let userInput = '';
			const chain = RunnableSequence.from<string, string>([
				RunnableLambda.from(async input => {
					userInput = input;
					const vars = await memory.loadMemoryVariables({ input }); //EntityMemory需要传入input
					return {
						input,
						chat_history: vars.history || vars.summary || ''
					};
				}),
				agent, //! prompt已经在agent里管理了,不要再在chain里加prompt （和单纯llm不同）
				//! StringOutputParser 会出错 其_baseMessageContentToString拿不到值
				RunnableLambda.from((input: any) => {
					//改用自定义的StringOutputParser
					if (
						typeof input === 'object' &&
						('output' in input || 'text' in input || 'content' in input)
					) {
						return String(input.output ?? input.text ?? input.content);
					} else if (Array.isArray(input)) {
						return input
							.map(item => {
								if (
									typeof item === 'object' &&
									('output' in item || 'text' in item || 'content' in item)
								) {
									return String(item.output ?? item.text ?? item.content);
								}
								return String(item);
							})
							.join('\n');
					}
					return String(input.content);
				}),
				RunnableLambda.from(async input => {
					await memory.saveContext({ input: userInput }, { output: input });
					return input;
				})
			]);
			return chain;
		} catch (error) {
			console.error('创建查询链失败:', error);
			throw error;
		}
	}
}
