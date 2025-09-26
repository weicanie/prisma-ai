import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { Injectable, Logger } from '@nestjs/common';
import {
	JobVo,
	resumeMatchedSchema,
	ResumeVo,
	SelectedLLM,
	UserFeedback,
	UserInfoFromToken
} from '@prisma-ai/shared';
import { z } from 'zod';
import { ModelService } from '../model/model.service';
import { ThoughtModelService } from '../model/thought-model.service';
import { KnowledgeVDBService } from '../business/prisma-agent/data_base/konwledge_vdb.service';
import { ProjectCodeVDBService } from '../business/prisma-agent/data_base/project_code_vdb.service';
import { ReflectAgentService } from '../business/prisma-agent/reflect_agent/reflect_agent.service';
import { PromptService } from '../prompt/prompt.service';
import { RubustStructuredOutputParser } from '../utils/RubustStructuredOutputParser';
import { ChainService } from './chain.service';
export interface ResumeMatchJobProcessingInput {
	resume: ResumeVo;
	job: JobVo;
	userFeedback: UserFeedback;
	userInfo: UserInfoFromToken;
}
export enum BusinessEnum {
	matchJob = 'matchJob'
}
@Injectable()
export class HjmChainService {
	logger = new Logger(HjmChainService.name);
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
		stream: boolean,
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
				// 接收 ResumeMatchJobProcessingInput 作为输入，为 Prompt 准备所有插槽变量
				input: (i: ResumeMatchJobProcessingInput) =>
					JSON.stringify({ resume: i.resume, job: i.job }),
				chat_history: () => '', // 暂不处理多轮对话历史
				instructions: () => outputParser.getFormatInstructions(),
				// 2. 反思逻辑：如果用户要求，则生成反思内容
				reflection: async (i: ResumeMatchJobProcessingInput) => {
					if (i.userFeedback.reflect && i.userFeedback.content) {
						const reflectionResult = await reflectChain.invoke({
							content: i.userFeedback.content,
							context: `${{ resume: i.resume, job: i.job }}`
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

	/**
	 * 将项目经验与岗位要求匹配
	 * @description 项目经验 + 岗位信息 -> 为岗位定制的项目经验
	 */
	async matchChain(stream = false, model: SelectedLLM) {
		const schema = resumeMatchedSchema;
		const prompt = await this.promptService.matchPrompt();

		const chain = await this._createProcessChain(
			() => Promise.resolve(prompt),
			schema,
			stream,
			model
		);
		if (stream) {
			return chain;
		}
		return chain;
	}
}
