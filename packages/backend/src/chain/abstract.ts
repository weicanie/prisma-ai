import { RunnableSequence } from '@langchain/core/runnables';
import z from 'zod';

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
