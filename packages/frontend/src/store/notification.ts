import type { UserNotification } from '@prisma-ai/shared';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface NotificationState {
	// 其实可以直接通过react-query的缓存来共享，但可追踪性不如redux
	// 所以还是用redux来管理
	notifications: UserNotification[];
	unreadCount: number;
	total: number;
	page: number;
	limit: number;
}

const initialState: NotificationState = {
	notifications: [],
	unreadCount: 0,
	total: 0,
	page: 1,
	limit: 5 // 每页5条
};

const notificationSlice = createSlice({
	name: 'notification',
	initialState,
	reducers: {
		setNotifications: (
			state,
			action: PayloadAction<{
				notifications: UserNotification[];
				total: number;
				unread_count: number;
			}>
		) => {
			state.notifications = action.payload.notifications;
			state.total = action.payload.total;
			state.unreadCount = action.payload.unread_count;
		},
		markAsRead: (state, action: PayloadAction<number>) => {
			const notification = state.notifications.find(n => n.id === action.payload);
			if (notification && !notification.is_read) {
				notification.is_read = true;
				state.unreadCount -= 1;
			}
		},
		// 批量标记所有通知为已读
		markAllAsRead: state => {
			state.notifications.forEach(notification => {
				if (!notification.is_read) {
					notification.is_read = true;
				}
			});
			state.unreadCount = 0;
		},
		// 设置当前页码
		setPage: (state, action: PayloadAction<number>) => {
			state.page = action.payload;
		}
	}
});

export const { setNotifications, markAsRead, markAllAsRead, setPage } = notificationSlice.actions;

export const selectNotifications = (state: { notification: NotificationState }) =>
	state.notification.notifications;
export const selectUnreadCount = (state: { notification: NotificationState }) =>
	state.notification.unreadCount;
export const selectTotalNotifications = (state: { notification: NotificationState }) =>
	state.notification.total;

// 选择当前页码
export const selectPage = (state: { notification: NotificationState }) => state.notification.page;
// 选择每页数量
export const selectLimit = (state: { notification: NotificationState }) => state.notification.limit;

export const notificationReducer = notificationSlice.reducer;
