import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts';
import { RunnableLambda, RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { Injectable } from '@nestjs/common';
import { BufferMemory } from 'langchain/memory';
import { ModelService } from '../model/model.service';
import { PromptService } from '../prompt/prompt.service';
@Injectable()
export class AichatChainService {
	constructor(
		public modelService: ModelService,
		public promptService: PromptService
	) {}

	/**
	 * 用于一次性问答,不感知上下文
	 * @param prompt
	 * @returns
	 */
	async createAnswerChain(prompt: ChatPromptTemplate) {
		const llm = await this.modelService.getLLMDeepSeekRaw('deepseek-chat');
		const outputParser = new StringOutputParser();
		const chain = RunnableSequence.from([prompt, llm, outputParser]);
		return chain;
	}

	chatPrompt = PromptTemplate.fromTemplate(`
		你是一个乐于助人的助手。尽你所能回答所有问题。
		{history}
		Human: {input}
		AI:
		`);

	/**
	 * 用于多轮对话,感知上下文。默认使用 ConversationSummaryMemory
	 * @param prompt 传递给llm的prompt
	 * @param memoryType memory类型，默认 ConversationSummaryMemory
	 * @returns
	 */
	async createChatChain(prompt = this.chatPrompt) {
		const chatHistory = this.modelService.getChatHistory('aichat'); //使用自定义的chatHistory
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

		const llm = await this.modelService.getLLMDeepSeekRaw('deepseek-reasoner');
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
				}
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
}
