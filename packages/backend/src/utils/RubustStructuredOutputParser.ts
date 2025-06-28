import { jsonMd_obj } from '@prism-ai/shared';
import { StructuredOutputParser } from 'langchain/output_parsers';
import z from 'zod';
import { WithFormfixChain } from '../chain/abstract';

/**
 * 一个更健壮的结构化输出解析器，用于解析LLM的输出。尤其是deepseek模型的输出,它极其执着于返回markdown格式的json块。
 * @description 如果解析失败，则先尝试使用jsonMd_obj进行修复。
 * @description 如果还修复失败，则使用格式修复链进行修复。
 */
export class RubustStructuredOutputParser<
	T extends z.ZodTypeAny
> extends StructuredOutputParser<T> {
	constructor(
		schema: T,
		private readonly chainService: WithFormfixChain
	) {
		super(schema);
	}

	static from<T extends z.ZodTypeAny>(
		schema: T,
		chainService: WithFormfixChain
	): RubustStructuredOutputParser<T> {
		return new RubustStructuredOutputParser(schema, chainService);
	}

	async parse(text: string): Promise<T> {
		try {
			const result = await super.parse(text);
			return result;
		} catch (error) {
			try {
				const result = await super.parse(jsonMd_obj(text));
				return result;
			} catch (_error) {
				const errorMessage = JSON.stringify(error.format());
				const fomartFixChain = await this.chainService.fomartFixChain(this.schema, errorMessage);
				const result = await fomartFixChain.invoke({ input: text });
				return result;
			}
		}
	}
}
