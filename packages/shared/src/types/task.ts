export interface PersistentTaskVo {
	id: string; // 任务唯一标识
	status: 'pending' | 'processing' | 'running' | 'completed' | 'failed'; // 任务状态
	progress?: {
		totalCount: number;
		completedCount: number;
	};
	error?: string;
	result?: any;
}
