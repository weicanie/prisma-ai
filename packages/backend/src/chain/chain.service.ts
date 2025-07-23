import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';
import { ChatDeepSeek } from '@langchain/deepseek';
import type { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	autoflowSchema,
	hjmRerankSchema,
	InterviewSummaryArticle,
	interviewSummaryArticleSchema,
	JobVo,
	LLMJobDto,
	llmJobSchema,
	projectSchema,
	ResumeVo,
	RoadFromDiffDto,
	roadFromDiffSchema
} from '@prisma-ai/shared';
import { BufferMemory } from 'langchain/memory';
import * as path from 'path';
import { z } from 'zod';
import { AgentService } from '../agent/agent.service';
import { MCPClientService } from '../mcp-client/mcp-client.service';
import { ModelService } from '../model/model.service';
import { PromptService, role } from '../prompt/prompt.service';
import { WithFormfixChain } from '../utils/abstract';
import { RubustStructuredOutputParser } from '../utils/RubustStructuredOutputParser';

const markdownNormalizeSchema = z.object({
	normalized_blocks: z
		.array(z.string())
		.describe('标准化后的Markdown代码块，必须与输入的顺序和数量完全一致')
});

@Injectable()
export class ChainService implements WithFormfixChain {
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
	async createChain<Input = string, Output = unknown>(
		llm: ChatOpenAI | ChatDeepSeek,
		prompt: ChatPromptTemplate,
		outputSchema: z.Schema,
		inputSchema?: z.Schema
	): Promise<RunnableSequence<Input, Output>> {
		const outputParser = RubustStructuredOutputParser.from<typeof outputSchema>(outputSchema, this);

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
				instructions_mid: async () => {
					const outputParser =
						inputSchema && RubustStructuredOutputParser.from<typeof inputSchema>(inputSchema, this);
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
					const outputParser = RubustStructuredOutputParser.from<typeof outputSchema>(
						outputSchema,
						this
					);
					return outputParser.getFormatInstructions();
				},
				/* 当输出包含输入格式的输出数据时,需要向模型指定 */
				instructions_mid: async () => {
					const outputParser =
						inputSchema && RubustStructuredOutputParser.from<typeof inputSchema>(inputSchema, this);
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
	 * 将批量的异常Markdown代码块字符串转换为标准格式
	 */
	async createMarkdownCodeBlockNormalizeChain() {
		const outputParser = RubustStructuredOutputParser.from<typeof markdownNormalizeSchema>(
			markdownNormalizeSchema,
			this
		);
		const prompt = ChatPromptTemplate.fromMessages([
			[
				'system',
				`你是一个Markdown格式化专家。用户会提供一个包含多个异常代码块字符串的JSON数组。
				异常代码字符串的内容是"复制/n/n\`混乱代码块\`"，混乱代码块中是行序号和代码行组成的字符串
你的任务是将每个字符串转换为标准的Markdown代码块,即根据行序号将混乱代码块转换为标准的Markdown代码块
- 识别代码的语言。
- 保持良好的缩进。
- **严格保持数组中代码块的原始顺序和数量**，并返回一个包含标准化后代码块的JSON对象。

注意：你不能改变任意代码行的内容，你只能根据行序号将混乱代码块转换为标准的Markdown代码块,并且转换后的代码块前后没有空行。

示例：
原始异常代码块：
\`1#div1 .c .d {{}} 2.f .c .d {{}} 3.a .c .e {{}} 4#div1 .f {{}} 5.c .d{{}}\`
转换后：
\`\`\`css
#div1 .c .d {{}} 
.f .c .d {{}} 
.a .c .e {{}} 
#div1 .f {{}} 
.c .d{{}}
\`\`\`
格式说明:
{instructions}
`
			],
			['human', '请标准化以下代码块：\n\n{code_blocks}']
		]);

		const llm = await this.modelService.getLLMDeepSeekRaw('deepseek-chat');
		const chain = RunnableSequence.from<
			{ code_blocks: string[] },
			z.infer<typeof markdownNormalizeSchema>
		>([
			{
				code_blocks: input => JSON.stringify(input.code_blocks),
				instructions: () => outputParser.getFormatInstructions()
			},
			prompt,
			llm,
			outputParser
		]);
		return chain;
	}

	/**
	 * 将文本转换为包含技能和项目经验的JSON
	 */
	async textToJsonChain() {
		const outputParser = RubustStructuredOutputParser.fromZodSchema(autoflowSchema);
		const prompt = await this.promptService.textToJsonPrompt();
		const llm = await this.modelService.getLLMDeepSeekRaw('deepseek-chat');

		const chain = RunnableSequence.from([
			{
				input: (input: { input: string }) => input.input,
				instructions: () => outputParser.getFormatInstructions()
			},
			prompt,
			llm,
			outputParser
		]);
		return chain;
	}

	/**
	 * 将所有分析结果整合为一份报告
	 */
	async resultsToTextChain() {
		const prompt = await this.promptService.resultsToTextPrompt();
		const llm = await this.modelService.getLLMDeepSeekRaw('deepseek-chat');

		const chain = RunnableSequence.from([
			{
				input: (input: { input: string }) => input.input
			},
			prompt,
			llm
			// 直接返回llm的string输出
		]);
		return chain;
	}

	/**
	 * 输入的文本项目经验（单个）转化为JSON
	 * @description 1、用户导入现有的项目经验,则通过llm转为JSON
	 * @description 2、用户以表单提交项目经验,则直接就是JSON
	 */
	async tansformChain() {
		const outputParser = RubustStructuredOutputParser.fromZodSchema(projectSchema);
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
		//@ts-ignore
		const outputParser = RubustStructuredOutputParser.fromZodSchema(schema);
		const prompt = ChatPromptTemplate.fromMessages([
			[
				`${role.SYSTEM}`,
				`
				用户将输入格式错误的项目经验描述。
				根据以下格式说明和错误信息修复格式错误。
				注意不要修改任何信息。
				格式说明:{instructions}
				错误信息:{errMsg}。
				输出要求：仅输出修复后的JSON对象，不要输出任何其他内容。
				`
			],
			[`${role.HUMAN}`, '{input}']
		]);
		//@ts-ignore
		const chain = RunnableSequence.from<{ input: string }, T>([
			{
				input: input => input.input,
				//@ts-ignore
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
		const outputParser = RubustStructuredOutputParser.from<typeof schema>(schema, this);
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
		const outputParser = RubustStructuredOutputParser.fromZodSchema(schema);

		const chain = RunnableSequence.from([
			{
				input: (input: { resume: ResumeVo; jobs: JobVo[] }) => {
					return JSON.stringify({
						用户简历: input.resume,
						岗位列表: input.jobs
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
	 * 将简历转化为岗位描述
	 * @description 简历 -> 岗位描述
	 */
	async hjmTransformChain(stream = false) {
		const schema = llmJobSchema;
		const prompt = await this.promptService.hjmTransformPrompt();
		const llm = this.modelService.getLLMDeepSeekRaw('deepseek-chat'); // 使用通用模型即可

		const chain = await this.createChain<string, LLMJobDto>(llm, prompt, schema);
		const streamChain = await this.createStreamChain<string>(llm, prompt, schema);
		if (stream) {
			return streamChain;
		}
		return chain;
	}

	/**
	 * @description 获取用于为面试题生成思维导图的Chain
	 */
	async getMindmapGenerationChain() {
		// 定义LLM响应的期望JSON结构，我们期望得到一个包含多个markdown字符串的数组
		const schema = z.object({
			results: z
				.array(z.string().describe('转换后的 markmap Markdown 文本'))
				.describe('与输入顺序严格对应的Markdown文本数组')
		});
		const parser = RubustStructuredOutputParser.from<typeof schema>(schema, this);

		const prompt = await this.promptService.generateMindmapPrompt();

		const model = this.modelService.getLLMDeepSeekRaw('deepseek-chat');

		const chain = RunnableSequence.from<
			{ questions: Record<string, string | number>[] },
			z.infer<typeof schema>
		>([
			{
				questions: input => JSON.stringify(input.questions),
				format_instructions: () => parser.getFormatInstructions()
			},
			prompt,
			model,
			parser
		]);
		return chain;
	}

	/**
	 * 从面经中生成问题清单
	 */
	async createInterviewSummaryGenerateChain() {
		const schema = z.object({
			questions: z.array(z.string()).describe('标准化后的面试问题列表')
		});
		const outputParser = RubustStructuredOutputParser.from<typeof schema>(schema, this);
		const llm = this.modelService.getLLMDeepSeekRaw('deepseek-chat');

		const prompt = await this.promptService.interviewSummaryGeneratePrompt();

		const chain = RunnableSequence.from<
			{
				input: string;
				job_type: string;
				company_name?: string;
				turn?: string;
				interview_type?: string;
			},
			z.infer<typeof schema>
		>([
			{
				input: input => input.input,
				format_instructions: () => outputParser.getFormatInstructions(),
				job_type: input => input.job_type,
				company_name: input => input.company_name ?? '未知',
				turn: input => input.turn ?? '未知',
				interview_type: input => input.interview_type ?? '未知'
			},
			prompt,
			llm,
			outputParser
		]);
		return chain;
	}

	/**
	 * 将问题清单中的问题转换为结构化面试题
	 */
	async createInterviewSummaryTransformChain(contentTypeEnum: { [key: string]: string[] }) {
		const schema = interviewSummaryArticleSchema;
		//@ts-ignore
		const outputParser = RubustStructuredOutputParser.from<typeof schema>(schema, this);

		const llm = this.modelService.getLLMDeepSeekRaw('deepseek-chat');
		const prompt = await this.promptService.interviewSummaryTransformPrompt();

		const chain = RunnableSequence.from<{ input: string }, InterviewSummaryArticle>([
			{
				input: input => input.input,
				//@ts-ignore
				format_instructions: () => outputParser.getFormatInstructions(),
				content_type_enum: () => JSON.stringify(contentTypeEnum)
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
