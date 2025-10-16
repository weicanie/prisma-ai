/**
 * 网站服务状态管理接口前后端共享的类型。
 */
export enum WebsiteStatus {
	ONLINE = 'online',
	MAINTENANCE = 'maintenance'
}
/**
 * 网站服务状态
 */
export interface WebsiteStatusDto {
	status: WebsiteStatus;
	message?: string;
}

export interface WebsiteStatusVo {
	status: WebsiteStatus;
	message?: string;
	pendingTasks?: number; // 阻塞中的任务
	runningTasks?: number; // 运行中的任务
}
