import { Command } from '@langchain/langgraph';
import {
	humanInputSchema,
	InterruptData,
	InterruptType,
	resultStepSchema,
	StreamingChunk,
	UserMemoryAction
} from '@prisma-ai/shared';
import z from 'zod';
import { PersistentTask } from './taskqueue';
export {
	humanInputSchema,
	InterruptType,
	resultStepSchema,
	ReviewType,
	UserAction,
	userActionSchema,
	type InterruptData
} from '@prisma-ai/shared';
/* 事件名列表 */
export enum EventList {
	/* 任务队列 */
	taskCompleted = 'taskCompleted',
	taskFailed = 'taskFailed',
	taskAborted = 'taskAborted',
	/* sse */
	chunkGenerated = 'chunkGenerated',
	SBERT_INIT = 'SBERT_INIT',
	/* user memory */
	userMemoryChange = 'userMemoryChange',
	/* cache invalidate */
	cacheProjectRetrievedDocAndCodeInvalidate = 'cacheProjectRetrievedDocAndCodeInvalidate', //项目检索到的文档和代码的缓存失效
	/* prisma agent */
	pa_start = 'pa_start', // prisma agent 开始执行
	pa_curSteamCreate = 'pa_curSteamCreate', // prisma agent 当前流创建
	pa_interrupt = 'pa_interrupt', // prisma agent 执行自我中断
	pa_recover = 'pa_recover', // prisma agent 执行恢复
	pa_end = 'pa_end', // prisma agent 执行结束
	userInterrupt = 'userInterrupt', // 用户手动中断
	userRecover = 'userRecover' // 用户手动恢复
}

/* 事件名到payload类型的映射 */
export interface Event_Payload {
	/* 任务队列 */
	[EventList.taskCompleted]: { task: PersistentTask };
	[EventList.taskFailed]: {
		task: PersistentTask;
		error: any;
	};
	[EventList.taskAborted]: { task: PersistentTask };
	/* sse */
	[EventList.chunkGenerated]: {
		taskId: string;
		eventData: StreamingChunk;
	};
	[EventList.SBERT_INIT]: void;
	/* user memory */
	[EventList.userMemoryChange]: UserMemoryAction;
	/* cache invalidate */
	[EventList.cacheProjectRetrievedDocAndCodeInvalidate]: { projectName: string; userId: string };
	/* prisma agent */
	[EventList.pa_start]: { metadata: AgentRunMetadata };
	[EventList.pa_curSteamCreate]: {
		metadata: { runId: string; interruptType?: InterruptType };
	};
	[EventList.pa_interrupt]: {
		metadata: AgentRunMetadata;
		interruptData: InterruptData;
	};
	[EventList.pa_recover]: {
		metadata: AgentRunMetadata;
		// 从何种中断中恢复
		type: InterruptType | 'user_made'; //'user_made'：用户手动中断
		resumeCommand: Command<z.infer<typeof humanInputSchema> | z.infer<typeof resultStepSchema>>;
	};
	[EventList.pa_end]: { metadata: AgentRunMetadata };
	[EventList.userInterrupt]: {
		metadata: AgentRunMetadata;
	};
	[EventList.userRecover]: {
		metadata: AgentRunMetadata;
	};
}
export interface AgentRunMetadata {
	runId: string;
	projectName?: string;
	userId: string;
}
