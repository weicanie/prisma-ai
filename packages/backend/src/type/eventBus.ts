import { StreamingChunk, UserMemoryAction } from '@prisma-ai/shared';
import { PersistentTask } from './taskqueue';

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
	cacheProjectRetrievedDocAndCodeInvalidate = 'cacheProjectRetrievedDocAndCodeInvalidate' //项目检索到的文档和代码的缓存失效
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
}
