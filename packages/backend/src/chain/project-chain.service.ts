import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Runnable, RunnableSequence } from '@langchain/core/runnables';
import { Inject, Injectable } from '@nestjs/common';
import {
	businessLookupResultSchema,
	businessPaperResultSchema,
	lookupResultSchema,
	ProjectDto,
	projectLookupResultSchema,
	projectMinResultSchma,
	projectPolishResultSchma,
	SelectedLLM,
	skillsToMarkdown,
	StreamingChunk,
	UserFeedback,
	UserInfoFromToken,
	userMemoryJsonToText
} from '@prisma-ai/shared';
import { z } from 'zod';
import { ReflectAgentService } from '../business/prisma-agent/reflect_agent/reflect_agent.service';
import { ModelService } from '../model/model.service';
import { ThoughtModelService } from '../model/thought-model.service';
import { PromptService } from '../prompt/prompt.service';
import { WithGetUserMemory } from '../type/abstract';
import { RubustStructuredOutputParser } from '../utils/RubustStructuredOutputParser';
import { ChainService } from './chain.service';
import { ProjectKonwbaseRetrieveService } from './project-konwbase-retrieve.service';
/**
 * @description 项目处理链的统一输入接口
 */
export interface ProjectProcessingInput {
	project: ProjectDto;
	userFeedback: UserFeedback;
	userInfo: UserInfoFromToken;
}

export enum BusinessEnum {
	lookup = 'lookup',
	polish = 'polish',
	mine = 'mine',
	businessLookup = 'businessLookup',
	businessPaper = 'businessPaper',
	aichat = 'aichat'
}

@Injectable()
export class ProjectChainService {
	constructor(
		public modelService: ModelService,
		public promptService: PromptService,
		public chainService: ChainService,
		private readonly reflectAgentService: ReflectAgentService,
		public thoughtModelService: ThoughtModelService,
		private readonly projectKonwbaseRetrieveService: ProjectKonwbaseRetrieveService,
		@Inject(WithGetUserMemory)
		private readonly userMemoryService: WithGetUserMemory
	) {}

	/**
	 * 创建一个集成了知识库检索和反思功能的项目处理链。
	 * @param promptGetter - 一个返回 ChatPromptTemplate 的异步函数。
	 * @param outputSchema - 用于解析最终输出的 Zod schema。
	 * @param inputSchema - (可选) 当输出包含输入格式时，用于生成格式说明的 Zod schema。
	 * @param stream - (可选) 是否以流式模式返回，默认为 false。
	 */
	async _createProcessChain(
		promptGetter: () => Promise<ChatPromptTemplate>,
		outputSchema: z.Schema,
		stream: boolean,
		business: BusinessEnum,
		model: SelectedLLM,
		userInfo: UserInfoFromToken
	) {
		const businessPrompt = await promptGetter();

		const userMemory = await this.userMemoryService.getUserMemory(userInfo.userId);
		const userMemoryText = userMemory ? userMemoryJsonToText(userMemory) : '';

		let llm: Runnable<any, StreamingChunk>;

		switch (model) {
			case SelectedLLM.gemini_2_5_pro:
			case SelectedLLM.gemini_2_5_pro_proxy:
			case SelectedLLM.gemini_2_5_flash:
				llm = await this.thoughtModelService.getGeminiThinkingModelFlat(
					model,
					userInfo.userConfig!
				);
				break;
			case SelectedLLM.deepseek_reasoner:
				llm = await this.thoughtModelService.getDeepSeekThinkingModleflat(
					'deepseek-reasoner',
					userInfo.userConfig!,
					outputSchema
				);
				break;
			case SelectedLLM.glm_4_6:
				llm = await this.thoughtModelService.getGLMThinkingModelFlat(
					SelectedLLM.glm_4_6,
					userInfo.userConfig!,
					outputSchema
				);
				break;
			default:
				throw new Error(`_createProcessChain-不支持的模型:${model}`);
		}

		// 动态地将 "思考指令" 与 "业务指令" 组合在一起
		// 实现功能prompt与业务prompt的关注点分离，业务组件直接当llm使用即可、
		// 需要注意的是deepseek-r1不需要思考指令，所以不需要组合（组合也问题不大，只是其没有绑定对应工具可能会带来困惑）
		const finalPrompt = ChatPromptTemplate.fromMessages([
			// 思考/答案分离输出时才使用（还未稳定）
			// ['system', THINKING_SYSTEM_PROMPT],
			...businessPrompt.promptMessages
		]);

		const outputParser = RubustStructuredOutputParser.from(outputSchema, this.chainService);
		const reflectChain = await this.reflectAgentService.createReflectChain(userInfo);

		const sequence: any = [
			{
				// 接收 ProjectProcessingInput 作为输入，为 Prompt 准备所有插槽变量
				input: (i: ProjectProcessingInput) => JSON.stringify(i.project),
				userMemory: () => userMemoryText,
				chat_history: () => '', // 暂不处理多轮对话历史
				instructions: () => outputParser.getFormatInstructions(),

				// 知识库集成：检索相关代码和文档
				retrievedProjectCodes: async (i: ProjectProcessingInput) => {
					return await this.projectKonwbaseRetrieveService.retrievedProjectCodes(i, business);
				},
				retrievedDomainDocs: async (i: ProjectProcessingInput) => {
					return await this.projectKonwbaseRetrieveService.retrievedDomainDocs(i, business);
				},

				// 2. 反思逻辑：如果用户要求，则生成反思内容
				reflection: async (i: ProjectProcessingInput) => {
					// console.log('_createProcessChain ~ reflection:', i);
					if (i.userFeedback.reflect && i.userFeedback.content) {
						const reflectionResult = await reflectChain.invoke({
							content: i.userFeedback.content,
							context: `项目信息: ${JSON.stringify(i.project)}`
						});
						// 将结构化的反思结果格式化为字符串，注入到 prompt 中
						return `
- 评价: ${reflectionResult.evaluation}
- 批评: ${reflectionResult.critique}
- 建议: ${reflectionResult.advice}
                        `;
					}
					return '无'; // 如果不需要反思，则传入"无"
				}
			},
			finalPrompt,
			llm
		];
		if (stream) {
			// 流式输出，不包含最终的解析器
			return RunnableSequence.from(sequence);
		}

		// 非流式输出，包含最终的解析器
		return RunnableSequence.from(sequence.concat([outputParser]));
	}

	async lookupChain(
		stream: true,
		model: SelectedLLM,
		userInfo: UserInfoFromToken
	): Promise<RunnableSequence<ProjectProcessingInput, StreamingChunk>>; //流式返回时输出类型是指单个chunk的类型
	async lookupChain(
		stream: false,
		model: SelectedLLM,
		userInfo: UserInfoFromToken
	): Promise<RunnableSequence<ProjectProcessingInput, z.infer<typeof lookupResultSchema>>>;
	/**
	 * 分析项目经验的问题和解决方案(升级版)
	 * @description 集成了知识库检索和用户反馈反思功能
	 * @param stream - 是否以流式模式返回
	 */

	async lookupChain(stream = false, model: SelectedLLM, userInfo: UserInfoFromToken) {
		const schema = projectLookupResultSchema;

		const chain = await this._createProcessChain(
			() => this.promptService.lookupPrompt(),
			schema,
			stream,
			BusinessEnum.lookup,
			model,
			userInfo
		);
		return chain;
	}

	async businessLookupChain(
		stream: true,
		model: SelectedLLM,
		userInfo: UserInfoFromToken
	): Promise<RunnableSequence<ProjectProcessingInput, StreamingChunk>>; //流式返回时输出类型是指单个chunk的类型
	async businessLookupChain(
		stream: false,
		model: SelectedLLM,
		userInfo: UserInfoFromToken
	): Promise<RunnableSequence<ProjectProcessingInput, string>>;

	/**
	 * 项目经验业务分析
	 */
	async businessLookupChain(stream: boolean, model: SelectedLLM, userInfo: UserInfoFromToken) {
		const schema = businessLookupResultSchema;
		return this._createProcessChain(
			() => this.promptService.businessLookupPrompt(),
			schema,
			stream,
			BusinessEnum.businessLookup,
			model,
			userInfo
		);
	}

	async businessPaperChain(
		stream: true,
		model: SelectedLLM,
		userInfo: UserInfoFromToken
	): Promise<RunnableSequence<ProjectProcessingInput, StreamingChunk>>;
	async businessPaperChain(
		stream: false,
		model: SelectedLLM,
		userInfo: UserInfoFromToken
	): Promise<RunnableSequence<ProjectProcessingInput, z.infer<typeof businessPaperResultSchema>>>;

	/**
	 * 生成项目经验面试材料
	 */
	async businessPaperChain(stream: boolean, model: SelectedLLM, userInfo: UserInfoFromToken) {
		const schema = businessPaperResultSchema;
		const chain = await this._createProcessChain(
			() => this.promptService.businessPaperPrompt(),
			schema,
			stream,
			BusinessEnum.businessPaper,
			model,
			userInfo
		);
		return chain;
	}

	/**
	 * 项目经验优化
	 */
	async polishChain(
		stream: true,
		model: SelectedLLM,
		userInfo: UserInfoFromToken
	): Promise<RunnableSequence<ProjectProcessingInput, StreamingChunk>>;
	async polishChain(
		stream: false,
		model: SelectedLLM,
		userInfo: UserInfoFromToken
	): Promise<RunnableSequence<ProjectProcessingInput, z.infer<typeof projectPolishResultSchma>>>;

	/**
	 * 优化项目经验的亮点(升级版)
	 * @description 集成了知识库检索和用户反馈反思功能
	 * @param stream - 是否以流式模式返回
	 */
	async polishChain(stream = false, model: SelectedLLM, userInfo: UserInfoFromToken) {
		const schema = projectPolishResultSchma;
		const chain = await this._createProcessChain(
			() => this.promptService.polishPrompt(),
			schema,
			stream,
			BusinessEnum.polish,
			model,
			userInfo
		);
		return chain;
	}

	async mineChain(
		stream: true,
		model: SelectedLLM,
		userInfo: UserInfoFromToken,
		skillService: any
	): Promise<RunnableSequence<ProjectProcessingInput, StreamingChunk>>;
	async mineChain(
		stream: false,
		model: SelectedLLM,
		userInfo: UserInfoFromToken,
		skillService: any
	): Promise<RunnableSequence<ProjectProcessingInput, z.infer<typeof projectMinResultSchma>>>;

	/**
	 * 挖掘项目经验的亮点(升级版)
	 * @description 集成了知识库检索和用户反馈反思功能
	 * @param stream - 是否以流式模式返回
	 */
	async mineChain(
		stream = false,
		model: SelectedLLM,
		userInfo: UserInfoFromToken,
		skillService: any
	) {
		const schema = projectMinResultSchma;
		//只取第一个用户技能
		let userSkills = await skillService.findAll(userInfo);
		const userSkillsMd = userSkills[0] ? skillsToMarkdown(userSkills[0]) : '';
		const promptTemplate = await this.promptService.minePrompt({ userSkills: userSkillsMd });

		// 小prompt测试用过，但大的就问题百出，gemini-2.5-pro的思考/答案分离输出
		// const llm = await this.thoughtModelService.getGeminiThinkingModleflat('gemini-2.5-pro');
		// const chainTest = ChatPromptTemplate.fromMessages([
		// 	['system', THINKING_SYSTEM_PROMPT],
		// 	['user', '请问x + 1 =3, x = ?']
		// ]).pipe(llm);
		// return chainTest;
		const chain = await this._createProcessChain(
			() => Promise.resolve(promptTemplate),
			schema,
			stream,
			BusinessEnum.mine,
			model,
			userInfo
		);

		return chain;
	}
}
