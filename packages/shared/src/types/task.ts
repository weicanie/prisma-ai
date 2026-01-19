export interface PersistentTaskVo {
	id: string; // 任务唯一标识
	sessionId?: string; // 关联的会话ID
	status: 'pending' | 'processing' | 'running' | 'completed' | 'failed'; // 任务状态
	progress?: {
		totalCount: number;
		completedCount: number;
	};
	error?: string;
	result?: any;
}
