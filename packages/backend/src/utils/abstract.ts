import { RunnableSequence } from '@langchain/core/runnables';
import { UserConfig, UserMemoryT } from '@prisma-ai/shared';
import z from 'zod';

/**
 * 提供格式修复chain的service
 */
export abstract class WithFormfixChain {
	abstract fomartFixChain<T = any>(
		schema: z.Schema,
		errMsg: string,
		userConfig?: UserConfig
	): Promise<
		RunnableSequence<
			{
				input: string;
			},
			Exclude<T, Error>
		>
	>;
}

/**
 * 提供用户记忆查询的服务
 */
export abstract class WithGetUserMemory {
	abstract getUserMemory(userId: string): Promise<UserMemoryT>;
}
