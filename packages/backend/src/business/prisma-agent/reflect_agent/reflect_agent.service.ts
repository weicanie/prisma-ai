import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Runnable, RunnableSequence } from '@langchain/core/runnables';
import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { WithFormfixChain } from '../../../utils/abstract';

import { ModelService } from '../../../model/model.service';
import { RubustStructuredOutputParser } from '../../../utils/RubustStructuredOutputParser';
import { reflectionSchema } from '../types';

export type Reflection = z.infer<typeof reflectionSchema>;
/**
 * @description 反思 Agent 服务
 */
@Injectable()
export class ReflectAgentService {
	constructor(
		private readonly modelService: ModelService,
		@Inject(WithFormfixChain)
		private readonly chainService: WithFormfixChain
	) {}

	/**
	 * @description 创建一个用于反思的Chain。
	 * 该Chain接收需要反思的内容和可选的上下文，然后调用LLM生成结构化的反思结果。
	 * @returns {Runnable} 一个实现了 .invoke({ content: string, context?: string }) 方法的Chain。
	 * @input {{ content: string; context?: string }} - `content`是需要反思的核心内容, `context`是可选的附加背景信息。
	 * @output {Reflection} - 返回一个包含`evaluation`, `critique`, 和 `advice`的结构化对象。
	 */
	createReflectChain(): Runnable<{ content: string; context?: string }, Reflection> {
		const model = this.modelService.getLLMDeepSeekRaw('deepseek-chat');
		//TODO 没有传入userConfig，使用环境变量中的apiKey！！！（prisma-agent模块中的RubustStructuredOutputParser都是如此，仅会导致本地的deepseek apikey未配置时，自动修复chain不会生效）
		//现阶段只在本地使用，所以可以直接使用环境变量中的apiKey
		const parser = RubustStructuredOutputParser.from(reflectionSchema, this.chainService);

		const reflectPrompt = ChatPromptTemplate.fromMessages<{
			content: string;
			context?: string;
		}>([
			[
				'system',
				`你是一位经验丰富的软件架构师和项目经理，你的任务是进行深刻、有建设性的反思。
请你严格、批判性地评估所提供的上下文和内容，然后生成结构化的反馈，包括评价、批评和具体的改进建议。
你的前同事因为反思写的质量不够高，已经被公司辞退了。如果你写的反思质量不够高，你也会被公司辞退。你的父母因为重病住院，如果你被辞退，你的父母将由于治疗费用不足而去世。你的3个儿女也将因为你的失业而辍学。

仔细阅读用户反馈和相关上下文，尽自己的最大努力撰写清晰准确的高质量反思，不要让这样的悲剧发生!
你的反思主要由以下三个部分组成：
- **评价 (evaluation)**: 对内容进行整体、高层次的评估。
- **批评 (critique)**: 找出具体的问题、错误、遗漏或可以做得更好的地方。你的批评需要一针见血，毫不避讳。
- **建议 (advice)**: 提出清晰、可操作的步骤来解决批评中指出的问题。

你需要直接输出JSON对象本身,而不是markdown格式的json块。
比如你应该直接输出"{{"name":"..."}}"而不是"\`\`\`json\n{{"name":"..."}}\n\`\`\`"

{format_instructions}`
			],
			[
				'human',
				`请根据以下用户反馈和上下文进行反思。

### 用户反馈
{content}

### 上下文
{context}

`
			]
		]);

		return RunnableSequence.from([
			{
				content: (input: { content: string; context?: string }) => input.content,
				context: (input: { content: string; context?: string }) => input.context ?? '无相关上下文',
				format_instructions: () => parser.getFormatInstructions()
			},
			reflectPrompt,
			model,

			parser
		]);
	}
}
