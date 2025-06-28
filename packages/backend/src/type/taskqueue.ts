/**
 * 任务状态枚举
 */
export enum TaskStatus {
	PENDING = 'pending', // 等待执行
	RUNNING = 'running', // 正在执行

	COMPLETED = 'completed', // 执行完成
	FAILED = 'failed', // 执行失败
	ABORTED = 'aborted' // 被中止
}

/**
 * 持久化任务项接口
 */
export interface PersistentTask {
	id: string; // 任务唯一标识
	sessionId: string; // 关联的会话ID
	userId: string; // 关联的用户ID
	resultKey?: string; // 任务结果的Redis键

	type: string; // 任务类型

	status: TaskStatus; // 任务状态
	createdAt: number; // 创建时间
	startedAt?: number; // 开始执行时间
	finishedAt?: number; // 结束时间

	error?: string; // 错误信息
	metadata?: any; // 任务元数据
}
