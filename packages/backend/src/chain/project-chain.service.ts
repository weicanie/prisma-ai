import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { Injectable } from '@nestjs/common';
import {
	lookupResultSchema,
	SelectedLLM,
	ProjectDto,
	projectLookupedSchema,
	projectMinedSchema,
	projectPolishedSchema,
	projectSchema,
	skillsToMarkdown,
	StreamingChunk,
	UserFeedback,
	UserInfoFromToken
} from '@prism-ai/shared';
import { z } from 'zod';
import { ModelService } from '../model/model.service';
import { ThoughtModelService } from '../model/thought-model.service';
import { KnowledgeVDBService } from '../prisma-agent/data_base/konwledge_vdb.service';
import { ProjectCodeVDBService } from '../prisma-agent/data_base/project_code_vdb.service';
import { ReflectAgentService } from '../prisma-agent/reflect_agent/reflect_agent.service';
import { PromptService } from '../prompt/prompt.service';
import { RubustStructuredOutputParser } from '../utils/RubustStructuredOutputParser';
import { ChainService } from './chain.service';

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
	mine = 'mine'
}

@Injectable()
export class ProjectChainService {
	constructor(
		public modelService: ModelService,
		public promptService: PromptService,
		public chainService: ChainService,
		private readonly knowledgeVDBService: KnowledgeVDBService,
		private readonly projectCodeVDBService: ProjectCodeVDBService,
		private readonly reflectAgentService: ReflectAgentService,
		public thoughtModelService: ThoughtModelService
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
		inputSchema: z.Schema,
		stream: boolean,
		business: BusinessEnum,
		model: SelectedLLM
	) {
		const businessPrompt = await promptGetter();
		let llm: any;
		switch (model) {
			case SelectedLLM.gemini_2_5_pro:
			case SelectedLLM.gemini_2_5_pro_proxy:
			case SelectedLLM.gemini_2_5_flash:
				llm = await this.thoughtModelService.getGeminiThinkingModelFlat(model);
				break;
			case SelectedLLM.deepseek_reasoner:
				llm = await this.thoughtModelService.getDeepSeekThinkingModleflat('deepseek-reasoner');
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
		const reflectChain = this.reflectAgentService.createReflectChain();

		const sequence: any = [
			{
				// 接收 ProjectProcessingInput 作为输入，为 Prompt 准备所有插槽变量
				input: (i: ProjectProcessingInput) => JSON.stringify(i.project),
				chat_history: () => '', // 暂不处理多轮对话历史
				instructions: () => outputParser.getFormatInstructions(),
				instructions_mid: () => {
					const inputParser = inputSchema && StructuredOutputParser.fromZodSchema(inputSchema);
					return inputParser ? inputParser.getFormatInstructions() : '';
				},

				//TODO 多轮检索, 比如每个亮点分别检索并标注其属于哪个亮点
				//TODO 使用SRAG降低幻觉,提高相关性
				//TODO 使用CRAG进行精炼、网络搜索（使用google的api：https://js.langchain.com/docs/integrations/chat/google_generativeai/#built-in-google-search-retrieval、serpapi）
				// 知识库集成：检索相关代码和文档
				retrievedProjectCodes: async (i: ProjectProcessingInput) => {
					try {
						let codeQuery = '';
						switch (business) {
							case BusinessEnum.lookup:
								return '无相关项目代码';
							case BusinessEnum.polish:
								codeQuery = `项目介绍: ${JSON.stringify(i.project.info.desc)} 项目亮点：${JSON.stringify(i.project.lightspot)}`;
								break;
							case BusinessEnum.mine:
								codeQuery = `项目介绍: ${JSON.stringify(i.project.info.desc)} 项目亮点：${JSON.stringify(i.project.lightspot)}`;
								break;
						}
						return await this.projectCodeVDBService.retrieveCodeChunks(
							codeQuery,
							5,
							i.userInfo.userId,
							i.project.info.name
						);
					} catch (e) {
						return '项目代码库未找到或检索失败';
					}
				},
				retrievedDomainDocs: async (i: ProjectProcessingInput) => {
					try {
						let docsQuery = '';
						switch (business) {
							case BusinessEnum.lookup:
								docsQuery = `项目名称: ${i.project.info.name}, 项目介绍: ${JSON.stringify(i.project.info.desc)}`;
								break;
							case BusinessEnum.polish:
								docsQuery = `项目名称: ${i.project.info.name}, 技术栈: ${i.project.info.techStack.join(',')}, 项目介绍: ${JSON.stringify(i.project.info.desc)} 项目亮点：${JSON.stringify(i.project.lightspot)}`;
								break;
							case BusinessEnum.mine:
								docsQuery = `项目名称: ${i.project.info.name}, 技术栈: ${i.project.info.techStack.join(',')}, 项目介绍: ${JSON.stringify(i.project.info.desc)} 项目亮点：${JSON.stringify(i.project.lightspot)}`;
								break;
						}
						// 使用 CRAG 版本的检索可以获得更高质量的知识
						return await this.knowledgeVDBService.retrieveKonwbase(
							docsQuery,
							5, // topK
							i.userInfo.userId
						);
					} catch (e) {
						return '相关文档库检索失败';
					}
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
		model: SelectedLLM
	): Promise<RunnableSequence<ProjectProcessingInput, StreamingChunk>>; //流式返回时输出类型是指单个chunk的类型
	async lookupChain(
		stream: false,
		model: SelectedLLM
	): Promise<
		RunnableSequence<
			ProjectProcessingInput,
			[z.infer<typeof lookupResultSchema>, z.infer<typeof projectLookupedSchema>]
		>
	>;
	/**
	 * 分析项目经验的问题和解决方案(升级版)
	 * @description 集成了知识库检索和用户反馈反思功能
	 * @param stream - 是否以流式模式返回
	 */
	async lookupChain(stream = false, model: SelectedLLM) {
		const schema = lookupResultSchema;
		const schema_mid = projectLookupedSchema;

		const chain = await this._createProcessChain(
			() => this.promptService.lookupPrompt(),
			schema,
			schema_mid,
			stream,
			BusinessEnum.lookup,
			model
		);
		return chain;
	}

	async polishChain(
		stream: true,
		model: SelectedLLM
	): Promise<RunnableSequence<ProjectProcessingInput, StreamingChunk>>;
	async polishChain(
		stream: false,
		model: SelectedLLM
	): Promise<
		RunnableSequence<
			ProjectProcessingInput,
			[z.infer<typeof projectPolishedSchema>, z.infer<typeof projectSchema>]
		>
	>;

	/**
	 * 优化项目经验的亮点(升级版)
	 * @description 集成了知识库检索和用户反馈反思功能
	 * @param stream - 是否以流式模式返回
	 */
	async polishChain(stream = false, model: SelectedLLM) {
		const schema = projectPolishedSchema;
		const schema_mid = projectSchema;
		const chain = await this._createProcessChain(
			() => this.promptService.polishPrompt(),
			schema,
			schema_mid,
			stream,
			BusinessEnum.polish,
			model
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
	): Promise<
		RunnableSequence<
			ProjectProcessingInput,
			[z.infer<typeof projectMinedSchema>, z.infer<typeof projectSchema>]
		>
	>;

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
		const schema = projectMinedSchema;
		const schema_mid = projectSchema;
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
			schema_mid,
			stream,
			BusinessEnum.mine,
			model
		);

		return chain;
	}
}
