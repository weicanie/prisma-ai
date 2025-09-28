import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableLambda, RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIChatLLM, UserMemoryT, UserModelConfig, userMemorySchema } from '@prisma-ai/shared';
import { BufferMemory } from 'langchain/memory';
import { ModelService } from '../model/model.service';
import { PromptService } from '../prompt/prompt.service';
import { AichatChainContext } from '../type/aichat';
import { RubustStructuredOutputParser } from '../utils/RubustStructuredOutputParser';
import { ChainService } from './chain.service';
@Injectable()
export class AichatChainService {
	constructor(
		public modelService: ModelService,
		public promptService: PromptService,
		public configService: ConfigService,
		public chainService: ChainService
	) {}

	/**
	 * 用于多轮对话,感知上下文。默认使用 ConversationSummaryMemory
	 * @param prompt 传递给llm的prompt
	 * @param memoryType memory类型，默认 ConversationSummaryMemory
	 * @returns
	 */
	async createChatChain(
		keyname: string,
		modelConfig: UserModelConfig<AIChatLLM>,
		aichatChainContext: AichatChainContext
	) {
		const prompt = await this.promptService.aichatSystemPrompt();
		const chatHistory = this.modelService.getChatHistory(keyname); //使用自定义的chatHistory
		//FIXME 使用ConversationSummaryMemory时,会话记录会丢失,是chatHistory的保存逻辑没支持
		// const memory = new ConversationSummaryMemory({
		// 	chatHistory: chatHistory,
		// 	memoryKey: 'history',
		// 	llm: this.modelService.getLLMDeepSeekRaw('deepseek-chat')
		// });
		const memory = new BufferMemory({
			chatHistory: chatHistory,
			memoryKey: 'history'
		});

		let llm: BaseChatModel;
		switch (modelConfig.llm_type) {
			case AIChatLLM.v3:
				llm = await this.modelService.getLLMDeepSeekRaw('deepseek-chat');
				break;
			case AIChatLLM.r1:
				llm = await this.modelService.getLLMDeepSeekRaw('deepseek-reasoner');
				break;
			case AIChatLLM.gemini_2_5_pro:
				llm = await this.modelService.getLLMGeminiPlusRaw('gemini-2.5-pro');
				break;
			case AIChatLLM.gemini_2_5_flash:
				llm = await this.modelService.getLLMGeminiPlusRaw('gemini-2.5-flash');
				break;
		}

		const outputParser = new StringOutputParser();

		let lastInput = ''; //储存用户当前输入（以更新memory）
		const chain = RunnableSequence.from([
			{
				input: (input, options) => {
					lastInput = input;
					return input;
				},
				history: async (input: any, options: any) => {
					const vars = await memory.loadMemoryVariables({ input }); //EntityMemory需要传入input
					return vars.history || vars.summary || '';
				},
				project_data: () => aichatChainContext.project_data,
				project_doc: () => aichatChainContext.project_doc,
				project_code: () => aichatChainContext.project_code,
				user_memory: () => aichatChainContext.user_memory
			},
			prompt,
			new RunnablePassthrough({
				func: async (input: any, options: any) => {
					return input;
				}
			}),
			llm,
			outputParser,
			RunnableLambda.from(async input => {
				await memory.saveContext({ input: lastInput }, { output: input });
				return input;
			})
		]);
		return chain;
	}

	async createUserMemoryChain(modelConfig: UserModelConfig<AIChatLLM>) {
		console.log('createUserMemoryChain');
		let llm: BaseChatModel;
		switch (modelConfig.llm_type) {
			case AIChatLLM.v3:
				llm = await this.modelService.getLLMDeepSeekRaw('deepseek-chat');
				break;
			case AIChatLLM.r1:
				llm = await this.modelService.getLLMDeepSeekRaw('deepseek-reasoner');
				break;
			case AIChatLLM.gemini_2_5_pro:
				llm = await this.modelService.getLLMGeminiPlusRaw('gemini-2.5-pro');
				break;
			case AIChatLLM.gemini_2_5_flash:
				llm = await this.modelService.getLLMGeminiPlusRaw('gemini-2.5-flash');
				break;
		}

		const outputParser = RubustStructuredOutputParser.from(userMemorySchema, this.chainService);
		const prompt = await this.promptService.createUserMemoryPrompt();

		const chain = RunnableSequence.from([
			{
				input: (i: {
					skill?: string;
					project?: string;
					work?: string;
					education?: string;
					job_target?: string;
				}) => JSON.stringify(i),
				format_instructions: () => outputParser.getFormatInstructions()
			},
			prompt,
			llm,
			outputParser
		]);
		return chain;
	}

	async updateUserMemoryChain(modelConfig: UserModelConfig<AIChatLLM>) {
		let llm: BaseChatModel;
		switch (modelConfig.llm_type) {
			case AIChatLLM.v3:
				llm = await this.modelService.getLLMDeepSeekRaw('deepseek-chat');
				break;
			case AIChatLLM.r1:
				llm = await this.modelService.getLLMDeepSeekRaw('deepseek-reasoner');
				break;
			case AIChatLLM.gemini_2_5_pro:
				llm = await this.modelService.getLLMGeminiPlusRaw('gemini-2.5-pro');
				break;
			case AIChatLLM.gemini_2_5_flash:
				llm = await this.modelService.getLLMGeminiPlusRaw('gemini-2.5-flash');
				break;
		}

		const outputParser = RubustStructuredOutputParser.from(userMemorySchema, this.chainService);
		const prompt = await this.promptService.updateUserMemoryPrompt();

		const chain = RunnableSequence.from([
			{
				input: (i: { existing_memory: UserMemoryT; new_info: string }) => JSON.stringify(i),
				format_instructions: () => outputParser.getFormatInstructions()
			},
			prompt,
			llm,
			outputParser
		]);
		return chain;
	}
}
