/**
 * 通知管理接口前后端共享的类型
 */
/**
 * 通知信息
 */
export interface Notification {
	id: number;
	title: string;
	content: string;
	create_at: Date;
	target_user: number | null;
	read_count: number;
	unread_count: number;
}

/**
 * 获取通知列表的响应
 */
export interface GetNotificationsResponse {
	notifications: Notification[];
	total: number;
}

/**
 * 获取通知列表的查询参数
 */
export interface GetNotificationsQuery {
	page: number;
	limit: number;
}

/**
 * 创建通知的请求体
 */
export interface CreateNotificationDto {
	title: string;
	content: string;
	target_user?: number;
}
