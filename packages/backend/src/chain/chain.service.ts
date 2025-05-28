import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';
import type { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BufferMemory } from 'langchain/memory';
import * as path from 'path';
import { z } from 'zod';
import { AgentService } from '../agent/agent.service';
import { MCPClientService } from '../mcp-client/mcp-client.service';
import { ModelService } from '../model/model.service';

import {
	lookupResultSchema,
	ProjectMinedDto,
	projectMinedSchema,
	ProjectPolishedDto,
	projectPolishedSchema,
	projectSchema
} from '@prism-ai/shared';
import { Observable } from 'rxjs';
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
		llm: ChatOpenAI,
		prompt: ChatPromptTemplate,
		schema: z.Schema
	): Promise<RunnableSequence<Input, Output>> {
		const outputParser = StructuredOutputParser.fromZodSchema(schema);

		const memory = new BufferMemory({
			chatHistory: this.modelService.getChatHistory(`${new Date().toLocaleDateString()}`)
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
				}
			},
			prompt,
			llm,
			outputParser,
			RunnableLambda.from(async input => {
				await memory.saveContext({ input: userInput }, { output: input });
				// console.log('格式化后的模型输出', input);
				return input;
			})
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
				格式说明:${outputParser.getFormatInstructions()}` // 内部的prompt会教JSON schema、给输入的JSON schema给llm
			],
			[`${role.HUMAN}`, '{input}']
		]);

		const llm = await this.modelService.getLLMDeepSeekRaw('deepseek-chat');
		const chain = RunnableSequence.from<{ input: string }, z.infer<typeof projectSchema>>([
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
				格式说明:${outputParser.getFormatInstructions()}
				${errMsg ? `错误信息:${errMsg}` : ''}`
			],
			[`${role.HUMAN}`, '{input}']
		]);
		const chain = RunnableSequence.from<{ input: string }, T>([prompt, llm, outputParser]);
		return chain;
	}

	/**
	 * 现有亮点评估、改进。
	 * @description -> 亮点突出
	 */
	async polishChain() {
		const schema = projectPolishedSchema;
		const outputParser = StructuredOutputParser.fromZodSchema(schema);
		const prompt = await this.promptService.polishPrompt(outputParser.getFormatInstructions());

		const llm = await this.modelService.getLLMDeepSeekRaw();

		const chain = await this.createChain<string, ProjectPolishedDto>(llm, prompt, schema);
		return chain;
	}

	/**
	 * 项目亮点挖掘。
	 * @description -> 亮点充足
	 */
	async mineChain() {
		const schema = projectMinedSchema;
		const outputParser = StructuredOutputParser.fromZodSchema(schema);
		const prompt = await this.promptService.polishPrompt(outputParser.getFormatInstructions());

		const llm = await this.modelService.getLLMDeepSeekRaw();

		const chain = await this.createChain<string, ProjectMinedDto>(llm, prompt, schema);
		return chain;
	}
	/**
	 * 分析项目经验的问题和解决方案
	 */
	async lookupChain() {
		const schema = lookupResultSchema;
		const outputParser = StructuredOutputParser.fromZodSchema(schema);
		const prompt = ChatPromptTemplate.fromMessages([
			[
				`${role.SYSTEM}`,
				`
				分析用户输入的项目经验描述。并按照以下格式输出问题和解决方案。

				先查找是否存在以下问题：
				a. 
				问题名称: 项目信息不完整
				问题描述: 项目信息中的<技术栈、角色和职责、核心贡献和参与、背景和目的信息>存在缺失。
				b. 
				问题名称: 项目亮点不突出
				问题描述: 罗列<常见技术的使用>和<普通业务的实现>。
				c. 
				问题名称: 项目缺乏亮点
				问题描述: <项目亮点的3个方面中的某一方面亮点缺乏>（即数量不足3个）。

				再然后根据不同问题给出解决方案：
				对于a问题: 
				解决方案名称：补全项目信息
				解决方案描述：补全项目信息中的<技术栈、角色和职责、核心贡献和参与、背景和目的>信息。
			  对于b问题: 
				解决方案名称：评估、改进项目现有亮点
				解决方案描述：评估并改进当前的项目亮点部分,避免罗列太多常见技术的使用和普通业务的实现。
				对于c问题: 
				解决方案名称：挖掘项目亮点
				解决方案描述: 挖掘<项目亮点的3个方面中的缺乏的某些方面>的亮点。

				你应该在理解用户输入的项目经验描述的基础上,分析出存在的问题和解决方案,应该尽量符合上述格式,且"<>"中的内容应该按照项目实际情况确定。

				最后打分,
				分数 = 100 - 问题数*20

				如果没有问题,则输出空数组。
				如果没有解决方案,则输出空数组。
				输出格式说明:${outputParser.getFormatInstructions()}
				`
			],
			[`${role.HUMAN}`, '{input}']
		]);

		const llm = await this.modelService.getLLMDeepSeekRaw('deepseek-chat');

		const chain = await this.createChain<string, z.infer<typeof schema>>(llm, prompt, schema);
		return chain;
	}

	/**
	 * 通过agent和mcp查询本地mongodb数据库
	 * @param query 用户输入的查询语句
	 */
	async queryChain() {
		try {
			const llm = await this.modelService.getLLMDeepSeekRaw('deepseek-chat');
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

	sseMock(prompt: string) {
		const data = new Observable<any>(subscriber => {
			subscriber.next({
				data: {
					content: 'llm说:Hello, world!\n',
					done: false
				}
			});
			subscriber.next({
				data: {
					content: 'llm说:This is a test.\n',
					done: false
				}
			});
			setTimeout(() => {
				subscriber.next({
					data: {
						content:
							'llm说:2秒后.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n',
						done: false
					}
				});
			}, 2 * 1000);
			setTimeout(() => {
				subscriber.next({
					data: {
						content:
							'llm说:4秒后bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.\n',
						done: false
					}
				});
			}, 4 * 1000);
			setTimeout(() => {
				subscriber.next({
					data: {
						content:
							'llm说:6秒后cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc.\n',
						done: false
					}
				});
			}, 6 * 1000);
			setTimeout(() => {
				subscriber.next({
					data: {
						content:
							'llm说:8秒后ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd.\n',
						done: false
					}
				});
			}, 8 * 1000);
			setTimeout(() => {
				subscriber.next({
					data: {
						content:
							'llm说:10秒后eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.\n',
						done: true
					}
				});
				subscriber.complete();
			}, 10 * 1000);
		});
		return data;
	}
}
