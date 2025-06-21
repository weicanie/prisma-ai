import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Runnable } from '@langchain/core/runnables';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { ModelService } from '../../model/model.service';

/**
 * @description 反思的结构化输出Zod Schema
 */
export const reflectionSchema = z.object({
	evaluation: z.string().describe('对输入内容的总体评价'),
	critique: z.string().describe('具体的批评，指出哪些地方做得不好或不应该做'),
	advice: z.string().describe('具体的改进建议，指出应该如何修改或应该做什么')
});

export type Reflection = z.infer<typeof reflectionSchema>;
/**
 * @description 反思 Agent 服务
 */
@Injectable()
export class ReflectAgentService {
	constructor(private readonly modelService: ModelService) {}

	/**
	 * @description 创建一个用于反思的Chain。
	 * 该Chain接收需要反思的内容和可选的上下文，然后调用LLM生成结构化的反思结果。
	 * @returns {Runnable} 一个实现了 .invoke({ content: string, context?: string }) 方法的Chain。
	 * @input {{ content: string; context?: string }} - `content`是需要反思的核心内容, `context`是可选的附加背景信息。
	 * @output {Reflection} - 返回一个包含`evaluation`, `critique`, 和 `advice`的结构化对象。
	 */
	createReflectChain(): Runnable<{ content: string; context?: string }, Reflection> {
		const model = this.modelService.getLLMDeepSeekRaw('deepseek-chat');

		const structuredLLM = model.withStructuredOutput(reflectionSchema, {
			name: 'reflection'
		});

		const reflectPrompt = ChatPromptTemplate.fromMessages<{
			content: string;
			context?: string;
		}>([
			[
				'system',
				`你是一位经验丰富的软件架构师和项目经理，你的任务是进行深刻、有建设性的反思。
请你严格、批判性地评估所提供的上下文和内容，然后生成结构化的反馈，包括评价、批评和具体的改进建议。

- **评价 (evaluation)**: 对内容进行整体、高层次的评估。
- **批评 (critique)**: 找出具体的问题、错误、遗漏或可以做得更好的地方。你的批评需要一针见血，毫不避讳。
- **建议 (advice)**: 提出清晰、可操作的步骤来解决批评中指出的问题。`
			],
			[
				'human',
				`请根据以下上下文和内容进行反思。

### 上下文
{context}

### 需要反思的内容
{content}

请严格按照 evaluation, critique, advice 的结构输出你的反思。`
			]
		]);

		return reflectPrompt.pipe(structuredLLM);
	}
}
