import type {
	GetUserNotificationsQuery,
	GetUserNotificationsResponse,
	ServerDataFormat
} from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useCustomMutation, useCustomQuery } from '../../query/config';
import { MANAGE_QUERY_KEY } from '../../query/keys';
import { instance } from '../config';

/**
 * 获取用户通知列表
 * @param query 查询参数
 */
export const useGetUserNotifications = (params: GetUserNotificationsQuery) => {
	return useCustomQuery<GetUserNotificationsResponse>(
		[MANAGE_QUERY_KEY.NOTIFICATIONS_USER, params],
		async () => {
			const res = await instance.get<ServerDataFormat<GetUserNotificationsResponse>>(
				'/manage/user/notifications',
				{
					params
				}
			);
			return res.data;
		},
		{
			enabled: !!localStorage.getItem('token'), // 仅在用户登录后调用
			refetchInterval: 15 * 1000 // 15秒轮询一次
		}
	);
};

/**
 * 将通知标记为已读
 */
export const useMarkNotificationAsRead = () => {
	const queryClient = useQueryClient();
	return useCustomMutation(
		async (notificationId: number) => {
			const res = await instance.post<object, ServerDataFormat<void>>(
				'/manage/user/notifications/read',
				{ notificationId }
			);
			return res.data;
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: [MANAGE_QUERY_KEY.NOTIFICATIONS_USER] });
			}
		}
	);
};

/**
 * 将所有未读通知标记为已读
 */
export const useMarkAllNotificationsAsRead = () => {
	const queryClient = useQueryClient();
	return useCustomMutation(
		async () => {
			const res = await instance.post<
				void,
				ServerDataFormat<{ success: boolean; markedCount: number }>
			>('/manage/user/notifications/read-all', void 0);
			return res.data;
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: [MANAGE_QUERY_KEY.NOTIFICATIONS_USER] });
			}
		}
	);
};
