import { AIMessageChunk } from '@langchain/core/messages';
import { Runnable, RunnableLambda } from '@langchain/core/runnables';
import { StreamEvent } from '@langchain/core/tracers/log_stream';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI, ChatOpenAIFields } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { SelectedLLM, StreamingChunk, UserConfig } from '@prisma-ai/shared';
import { z } from 'zod';
import { DeepSeekStreamChunk } from '../type/sse';
import { GlmModel, GlmNeed, ModelService } from './model.service';
// TODO gemini 思考与回答分离方案
// streamEvents + tool方案是可以实现gemini的思考/答案的分离输出，但prompt复杂（比如现在的要求复杂JSON输出）gemini的生成格式就会出错

//TODO langchain.js官方issue表明其自身存在相关的恶性bug！
// https://github.com/langchain-ai/langchainjs/issues/6440
// withStructuredOutput包裹的llm会"假流式"输出（生成结束后才流式返回）

/**
 * Gemini "思考/答案" 功能所需的系统提示。
 * 调用方需要将此提示整合到最终发送给模型的完整提示中。
 */
export const THINKING_SYSTEM_PROMPT = `你有一个用于回答问题的工具。通过输出一个包含两个键的 JSON 对象来访问此工具：“thought”和“answer”。 “thought”键应包含您逐步推理如何回答用户问题的过程。 “answer”键应包含最终答案。你的思考过程应使用中文。如果你需要在thought或者answer中写入json格式的数据，禁止使用markdown格式！也就是禁止使用\`\`\`json\n\`\`\`这种格式！
`;

/**
 * 定义我们期望 Gemini 输出的结构。
 * LangChain 会将此 Zod Schema 转换为模型可以理解的工具调用指令。
 */
export const ThoughtAndAnswerSchema = z.object({
	thought: z
		.string()
		.describe('详细思考过程和推理步骤。直接输出可直接反序列化的json格式,禁止使用markdown格式！'),
	answer: z
		.string()
		.describe(
			'根据思考过程得出的最终、完整的答案。直接输出可直接反序列化的json格式,禁止使用markdown格式！'
		)
});

/**
 * 从 Zod Schema 推断出的 TypeScript 类型。
 */
export type ThoughtAndAnswer = z.infer<typeof ThoughtAndAnswerSchema>;

/**
 * 提供思考模型的流式调用API
 * @description 它负责将模型返回的结构化流转换为现有API（如SSE）所期望的`StreamingChunk` 格式。
 */
@Injectable()
export class ThoughtModelService {
	logger = new Logger(ThoughtModelService.name);
	constructor(private readonly modelService: ModelService) {}

	/**
	 * 获取一个即用型的、模拟 deepseek-r1 "思考/答案" 分离输出功能的 Runnable (Gemini版本)。
	 * 这个返回的 Runnable 接收一个 PromptValue (通常由 ChatPromptTemplate 生成)
	 * 并流式输出 `StreamingChunk` 对象。
	 * @warning 复杂prompt+结构化输出下，gemini-2.5-pro的思考/答案分离输出会出错！
	 * @param config - 模型配置或预设名称 'gemini-2.5-pro'
	 * @returns 一个配置好的、可以直接调用的 Runnable 实例，它扮演一个 "思考型LLM" 的角色。
	 */
	async getGeminiThinkingModelDivided(
		config: ChatOpenAIFields | ChatGoogleGenerativeAI | SelectedLLM
	): Promise<Runnable<any, StreamingChunk>> {
		const thoughtAnswerLLM = await this._getGeminiThinkingCore(config);

		// 最终模型：使用RunnableLambda封装整个流转换过程
		const flatModel = new RunnableLambda<{ input: string }, any>({
			func: async (prompt: any) => {
				const streamEvents = await thoughtAnswerLLM.streamEvents(prompt, { version: 'v1' });
				return this._transformEventsToChunks(streamEvents);
			}
		});

		return flatModel as Runnable<any, StreamingChunk>;
	}

	/**
	 * 进行默认输出的gemini-2.5-pro模型，不进行思考与答案分离，流式输出StreamingChunk（兼容原接口）
	 * @param config
	 * @returns
	 */
	async getGeminiThinkingModelFlat(
		config: ChatOpenAIFields | ChatGoogleGenerativeAI | SelectedLLM,
		userConfig: UserConfig,
		schema?: z.Schema
	) {
		let llm: ChatOpenAI | ChatGoogleGenerativeAI;
		switch (config) {
			case SelectedLLM.gemini_2_5_pro_proxy:
				llm = this.modelService.getLLMGeminiRaw('gemini-2.5-pro', userConfig.llm.openai.apiKey); //代理的apiKey
				if (schema) {
					llm = llm.withStructuredOutput(schema) as any;
				}
				break;
			case SelectedLLM.gemini_2_5_pro:
				llm = this.modelService.getLLMGeminiPlusRaw(
					'gemini-2.5-pro',
					userConfig.llm.googleai.apiKey
				);
				if (schema) {
					llm = llm.withStructuredOutput(schema) as any;
				}
				break;
			case SelectedLLM.gemini_2_5_flash:
				llm = this.modelService.getLLMGeminiPlusRaw(
					'gemini-2.5-flash',
					userConfig.llm.googleai.apiKey
				);
				if (schema) {
					llm = llm.withStructuredOutput(schema) as any;
				}
				break;
			default:
				throw new Error(`getGeminiThinkingModelFlat-不支持的gemini模型:${config}`);
		}

		// 使用RunnableLambda封装整个流转换过程
		const flatModel = new RunnableLambda<any, any>({
			func: async (prompt: any) => {
				const stream = await llm.stream(prompt);
				return this._transformAIMessageStream(stream, 'Gemini');
			}
		});

		return flatModel as Runnable<any, StreamingChunk>;
	}

	/**
	 * 进行默认输出的gemini-2.5-pro模型，不进行思考与答案分离，流式输出StreamingChunk（兼容原接口）
	 * @param config
	 * @returns
	 */
	async getGLMThinkingModelFlat(config: SelectedLLM, userConfig: UserConfig, schema?: z.Schema) {
		let llm: ChatOpenAI;
		switch (config) {
			case SelectedLLM.glm_4_6:
				llm = await this.modelService.glmModelpool({
					need: GlmNeed.high,
					apiKey: userConfig!.llm.zhipu.apiKey,
					modelName: GlmModel.glm_4_6
				});
				break;
			default:
				throw new Error(`getGLMThinkingModelFlat-不支持的glm模型:${config}`);
		}

		if (schema) {
			llm = llm.withStructuredOutput(schema) as any;
		}

		// 使用RunnableLambda封装整个流转换过程
		const flatModel = new RunnableLambda<any, any>({
			func: async (prompt: any) => {
				const stream = await llm.stream(prompt);
				return this._transformAIMessageStream(stream, 'GLM');
			}
		});

		return flatModel as Runnable<any, StreamingChunk>;
	}

	/**
	 * 获取一个即用型的、封装了 deepseek-r1 "思考/答案" 分离输出功能的 Runnable。
	 * 这个返回的 Runnable 接收一个 PromptValue (通常由 ChatPromptTemplate 生成)
	 * 并流式输出 `StreamingChunk` 对象。
	 * @param config - 模型配置或预设名称 'deepseek-reasoner'
	 * @returns 一个配置好的、可以直接调用的 Runnable 实例，它扮演一个 "思考型LLM" 的角色。
	 */
	async getDeepSeekThinkingModleflat(
		config: ChatOpenAIFields | 'deepseek-reasoner',
		userConfig: UserConfig,
		schema?: z.Schema
	): Promise<Runnable<any, StreamingChunk>> {
		if (config === 'deepseek-reasoner') {
			config = {
				...this.modelService.deepseek_config,
				configuration: {
					...this.modelService.deepseek_config.configuration,
					apiKey: userConfig.llm.deepseek.apiKey
				}
			};
		}
		let llm = await this.modelService.getLLMDeepSeek(config);
		if (schema) {
			llm = llm.withStructuredOutput(schema) as any;
		}
		if (!llm) {
			throw new Error('获取 DeepSeek 模型实例失败。');
		}
		const flatModel = new RunnableLambda<any, any>({
			func: async (input: any) => {
				const stream = await llm.stream(input);
				// as any 是为了解决类型兼容性问题，因为原始流类型是 AIMessageChunk 与实际的DeepSeekStreamChunk不兼容
				return this._transformDeepSeekStream(stream as any);
			}
		});
		return flatModel as Runnable<any, StreamingChunk>;
	}

	/**
	 * 将一个输出 AIMessageChunk 对象的流，转换为输出 StreamingChunk 对象的流。
	 * 这个方法用于处理普通的 LLM 流式输出，直接将内容作为答案返回。
	 * @param stream - 一个 `AIMessageChunk` 类型的异步生成器。
	 * @returns 一个 `StreamingChunk` 类型的异步生成器。
	 */
	async *_transformAIMessageStream(
		stream: AsyncGenerator<AIMessageChunk>,
		llmType: string
	): AsyncGenerator<StreamingChunk> {
		for await (const chunk of stream) {
			// 直接将 chunk 的内容作为答案返回
			let content = '';

			// 处理不同类型的 content
			if (typeof chunk.content === 'string') {
				content = chunk.content;
			} else if (chunk.text) {
				content = chunk.text;
			}

			if (content) {
				yield {
					content: content,
					reasonContent: '',
					isReasoning: false,
					done: false
				};
			}
		}
		yield { content: '', reasonContent: '', isReasoning: false, done: true };
	}

	/**
	 * [核心转换器] 将 langChain 的原始事件流转换为前端所需的 StreamingChunk 流。
	 * 此实现现在符合 LangChain 的标准，通过检查 `tool_call_chunks` 来提取流式数据，
	 * 同时保持对旧版 `additional_kwargs` 格式的兼容性。
	 * @param eventStream 来自于 .streamEvents() 的原始事件流。
	 * @returns 一个符合前端需求的 StreamingChunk 异步生成器。
	 */
	private async *_transformEventsToChunks(
		eventStream: AsyncGenerator<StreamEvent>
	): AsyncGenerator<StreamingChunk> {
		let accumulatedJson = '';
		const lastKnownState: ThoughtAndAnswer = { thought: '', answer: '' };

		for await (const event of eventStream) {
			this.logger.debug('event.event', event.event);
			this.logger.debug('accumulatedJson', accumulatedJson);
			if (event.event === 'on_llm_stream') {
				const chunk = event.data.chunk as AIMessageChunk;
				const textChunk = chunk.text;

				if (typeof textChunk === 'string' && textChunk.length > 0) {
					accumulatedJson += textChunk;

					// 使用正则表达式从可能不完整的JSON字符串中提取"thought"的内容
					const thoughtMatch = accumulatedJson.match(/"thought"\s*:\s*"((?:\\.|[^"\\])*)/);
					if (thoughtMatch && thoughtMatch[1]) {
						const currentThought = thoughtMatch[1];
						if (currentThought.length > lastKnownState.thought.length) {
							const newPart = currentThought.slice(lastKnownState.thought.length);
							yield { content: '', reasonContent: newPart, isReasoning: true, done: false };
							lastKnownState.thought = currentThought;
						}
					}

					// 使用正则表达式从可能不完整的JSON字符串中提取"answer"的内容
					const answerMatch = accumulatedJson.match(/"answer"\s*:\s*"((?:\\.|[^"\\])*)/);
					if (answerMatch && answerMatch[1]) {
						const currentAnswer = answerMatch[1];
						if (currentAnswer.length > lastKnownState.answer.length) {
							const newPart = currentAnswer.slice(lastKnownState.answer.length);
							yield { content: newPart, reasonContent: '', isReasoning: false, done: false };
							lastKnownState.answer = currentAnswer;
						}
					}
				}
			} else if (event.event === 'on_llm_end') {
				// 确保在流结束后发送一个最终的 done 信号
				yield { content: '', reasonContent: '', isReasoning: false, done: true };
				// 正常结束，可以退出了
				return;
			}
		}
		// 以防万一，如果流意外结束（例如，没有 on_llm_end 事件），也发送一个 done 信号
		yield { content: '', reasonContent: '', isReasoning: false, done: true };
	}

	/**
	 * [核心方法] 获取一个能输出 "思考/答案" 结构化对象的原始 Runnable (Gemini版本)。
	 * 这个返回的 Runnable 是所有上层思考模型功能的基础。
	 * @param config - 模型配置或预设名称 'gemini-2.5-pro'
	 * @returns 一个 Runnable 实例，其输出是 {thought: string, answer: string} 对象。
	 */
	async _getGeminiThinkingCore(
		config: ChatOpenAIFields | ChatGoogleGenerativeAI | SelectedLLM
	): Promise<Runnable<any, ThoughtAndAnswer>> {
		let llm: ChatOpenAI | ChatGoogleGenerativeAI;
		switch (config) {
			case SelectedLLM.gemini_2_5_pro_proxy:
				llm = this.modelService.getLLMGeminiRaw('gemini-2.5-pro');
				break;
			case SelectedLLM.gemini_2_5_pro:
				llm = this.modelService.getLLMGeminiPlusRaw('gemini-2.5-pro');
				break;
			case SelectedLLM.gemini_2_5_flash:
				llm = this.modelService.getLLMGeminiPlusRaw('gemini-2.5-flash');
				break;
			default:
				throw new Error(`不支持的gemini模型:${config}`);
		}

		try {
			const thoughtAndAnswerLLM = (llm as ChatGoogleGenerativeAI).withStructuredOutput(
				ThoughtAndAnswerSchema
			);
			return thoughtAndAnswerLLM as Runnable<any, ThoughtAndAnswer>;
		} catch (error) {
			this.logger.error('getGeminiThinkingCore-error', error);
			throw error;
		}
	}

	/**
	 * 将一个输出 DeepSeekStreamChunk 对象的流，转换为输出 StreamingChunk 对象的流。
	 * @param stream - 一个 `DeepSeekStreamChunk` 类型的异步生成器。
	 * @returns 一个 `StreamingChunk` 类型的异步生成器。
	 */
	async *_transformDeepSeekStream(
		stream: IterableReadableStream<DeepSeekStreamChunk>
	): AsyncGenerator<StreamingChunk> {
		for await (const chunk of stream) {
			const isReasoning =
				chunk.additional_kwargs?.reasoning_content !== null &&
				chunk.additional_kwargs?.reasoning_content !== undefined;

			// deepseek的流结束信号是 content 和 reasoning_content 都为 null
			const done = !chunk.content && chunk.additional_kwargs?.reasoning_content === null;

			if (done) {
				yield { content: '', reasonContent: '', isReasoning: false, done: true };
				return; // 流结束
			}

			yield {
				content: !isReasoning ? chunk.content : '',
				reasonContent: isReasoning ? (chunk.additional_kwargs?.reasoning_content ?? '') : '',
				done: false,
				isReasoning
			};
		}
		// 以防万一，如果流意外结束，也发送一个done信号
		yield { content: '', reasonContent: '', isReasoning: false, done: true };
	}
}
