import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';
import { ChatDeepSeek } from '@langchain/deepseek';
import type { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	hjmRerankSchema,
	JobVo,
	lookupResultSchema,
	projectLookupedSchema,
	ProjectMinedDto,
	projectMinedSchema,
	ProjectPolishedDto,
	projectPolishedSchema,
	projectSchema,
	ResumeMatchedDto,
	resumeMatchedSchema,
	ResumeVo,
	RoadFromDiffDto,
	roadFromDiffSchema
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
					return outputParser.getFormatInstructions();
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
	 * 将query关键词扩展为关键词数组,用于爬取岗位信息时扩大搜索范围
	 * @returns
	 */
	async queryExpandChain() {
		const schema = z.array(z.string());
		const llm = this.modelService.getLLMDeepSeekRaw('deepseek-chat');
		const outputParser = StructuredOutputParser.fromZodSchema(schema);
		const prompt = ChatPromptTemplate.fromMessages([
			[
				`${role.SYSTEM}`,
				`
				用户将给你一个岗位关键词，你需要返回尽可能多的能映射到现实世界存在的相关岗位的岗位关键词。
				比如用户输入"前端"，你返回:
				岗位类别相近词: 前端工程师、web前端工程师、前端开发、react工程师、vue工程师...
				岗位领域相关词: web前端、小程序、低代码...
				带状态的岗位关键词: 前端工程师(居家办公)/前端开发(远程)/web前端(转正实习)...
				...

				输出格式说明:{instructions}
				注意：1、按和用户输入的岗位关键词的相关程度从高到低排序; 2、你必须使用中文输出。
				`
			],
			[`${role.HUMAN}`, '{input}']
		]);
		const chain = RunnableSequence.from<{ input: string }, z.infer<typeof schema>>([
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
	 * 分析项目经验的问题和解决方案
	 */
	async lookupChain(stream = false) {
		const schema = lookupResultSchema;
		const schema0 = projectLookupedSchema;
		const prompt = await this.promptService.lookupPrompt();

		const llm = await this.modelService.getLLMDeepSeekRaw('deepseek-reasoner');

		const shemaTotal = z.tuple([schema, schema0]);
		const chain = await this.createChain<string, ProjectMinedDto>(llm, prompt, shemaTotal);
		const streamChain = await this.createStreamChain<string>(llm, prompt, schema, schema0);
		if (stream) {
			return streamChain;
		}
		return chain;
	}

	/**
	 * 现有亮点评估、改进。
	 * @description -> 亮点突出
	 */
	async polishChain(stream = false) {
		const schema = projectPolishedSchema;
		const schema0 = projectSchema; // 输入的schema
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
	 * 将项目经验与岗位要求匹配
	 * @description 项目经验 + 岗位信息 -> 为岗位定制的项目经验
	 */
	async matchChain(stream = false) {
		const schema = resumeMatchedSchema;

		const prompt = await this.promptService.matchPrompt();

		const llm = this.modelService.getLLMDeepSeekRaw('deepseek-reasoner');

		const chain = await this.createChain<string, ResumeMatchedDto>(llm, prompt, schema);
		const streamChain = await this.createStreamChain<string>(llm, prompt, schema);
		if (stream) {
			return streamChain;
		}
		return chain;
	}

	/**
	 * 对比简历A、B, B由A优化而来, 生成学习路线
	 * @description 简历A + 简历B -> 学习路线
	 */
	async roadChain(stream = false) {
		const schema = roadFromDiffSchema;

		const prompt = await this.promptService.diffLearnPrompt();

		const llm = this.modelService.getLLMDeepSeekRaw('deepseek-reasoner');

		const chain = await this.createChain<string, RoadFromDiffDto>(llm, prompt, schema);
		const streamChain = await this.createStreamChain<string>(llm, prompt, schema);
		if (stream) {
			return streamChain;
		}
		return chain;
	}

	/**
	 * 创建人岗匹配的rerank链
	 * @description LLM接收简历和多个岗位，返回rerank后的岗位列表和匹配原因
	 * @param top_n 返回的岗位数量,默认5
	 * @returns 返回一个可执行的链，输入为 { resume: ResumeVo, jobs: JobVo[] }
	 */
	async hjmRerankChain(top_n = 5) {
		const schema = hjmRerankSchema;
		const prompt = await this.promptService.hjmRerankPrompt();
		const llm = this.modelService.getLLMDeepSeekRaw('deepseek-chat'); // 使用通用模型即可
		const outputParser = StructuredOutputParser.fromZodSchema(schema);

		const chain = RunnableSequence.from([
			{
				input: (input: { resume: ResumeVo; jobs: JobVo[] }) => {
					// 将输入对象转换为符合prompt格式的字符串
					const resumeText = `技能: ${input.resume.skill.content
						.map(s => s.content?.join(','))
						.join('; ')}. 项目经验: ${input.resume.projects
						.map(p => `${p.info.name} - ${p.lightspot.skill.join(',')}`)
						.join('; ')}`;
					const jobsText = input.jobs.map(j => ({
						id: j.id,
						description: j.description
					}));
					return JSON.stringify({
						resume: resumeText,
						jobs: jobsText
					});
				},
				instructions: async () => {
					return outputParser.getFormatInstructions();
				},
				top_n: () => top_n
			},
			prompt,
			llm,
			outputParser
		]);

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
