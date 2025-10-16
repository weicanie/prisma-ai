/**
 * 用户通知中心接口前后端共享的类型。
 */
/**
 * 用户通知信息
 */
export interface UserNotification {
	id: number;
	title: string;
	content: string;
	create_at: Date;
	is_read: boolean;
	notification_id: number;
}

/**
 * 获取用户通知列表的响应
 */
export interface GetUserNotificationsResponse {
	notifications: UserNotification[];
	total: number;
	unread_count: number;
}

/**
 * 获取用户通知列表的查询参数
 */
export interface GetUserNotificationsQuery {
	page: number;
	limit: number;
	is_read?: boolean;
}
