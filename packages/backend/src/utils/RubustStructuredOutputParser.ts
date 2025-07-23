import { StructuredOutputParser } from 'langchain/output_parsers';
import z from 'zod';
import { WithFormfixChain } from '../utils/abstract';

/**
 * 替换字符串值中非法的、未被转义的换行符，而保留已转义的序列。
 * @param jsonString 可能格式不正确的JSON字符串（如来自LLM的JSON输出）。
 * @returns 修复后的JSON字符串。如果在修复后仍然无法解析，则返回空字符串。
 */
function fixJsonString(jsonString: string): string {
	try {
		// 乐观尝试：也许JSON是合法的
		JSON.parse(jsonString);
		return jsonString;
	} catch (error) {
		console.warn('JSON解析失败，尝试修复字符串内的```json和换行符转义问题', error.message);

		// 如果jsonString是markdown格式，则先提取出json字符串
		const jsonInMd = jsonString.match(/(?<=```json)(.*)(?=```)/gs)?.[0];
		if (jsonInMd) {
			jsonString = jsonInMd;
		}
		// 正则表达式，用于匹配一个完整的JSON字符串字面量。
		// 它能正确处理内部的转义字符，如 \"。
		const stringLiteralRegex = /"((?:\\.|[^"\\])*)"/g;
		// 使用replace的回调函数，对每个匹配到的字符串字面量进行操作
		const repairedJsonString = jsonString.replace(stringLiteralRegex, (match, group1) => {
			// group1 是字符串的值，不包括引号

			// 使用负向先行断言来精准替换
			// 1. 将所有非法的 \n 替换为 \\n
			// 2. 将所有非法的 \r 替换为 \\r (处理 Windows 换行符 \r\n)
			const repairedValue = group1.replace(/(?<!\\)\r/g, '\\r').replace(/(?<!\\)\n/g, '\\n');

			// 重新组装成带引号的字符串并返回
			return `"${repairedValue}"`;
		});

		try {
			// 再次尝试用修复后的字符串进行解析
			JSON.parse(repairedJsonString);
			console.warn('修复成功');
			return repairedJsonString;
		} catch (finalError) {
			console.warn('修复失败,将使用格式修复 chain 进行修复', finalError.message);
			return jsonString;
		}
	}
}

//! langchain的 StructuredOutputParser 提供的prompt 要求llm的json输出通过```json ```包裹，而它却不能解析这种格式，sb

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
				const result = await super.parse(fixJsonString(text));
				return result;
			} catch (_error) {
				const fomartFixChain = await this.chainService.fomartFixChain(
					this.schema,
					_error.message || _error.toString?.() || '错误信息未提供'
				);
				const result = await fomartFixChain.invoke({ input: text });
				return result;
			}
		}
	}
}
