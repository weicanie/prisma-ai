import { RunnableSequence } from '@langchain/core/runnables';
import z from 'zod';
import { SseFunc } from './type';
/**
 * 提供sse数据源函数的service
 */
export abstract class WithFuncPool {
	abstract funcPool: Record<string, SseFunc>;
	abstract poolName: string;
}
/**
 * 提供格式修复chain的service
 */
export abstract class WithFormfixChain {
	abstract fomartFixChain<T = any>(
		schema: z.Schema,
		errMsg: string
	): Promise<
		RunnableSequence<
			{
				input: string;
			},
			Exclude<T, Error>
		>
	>;
}
