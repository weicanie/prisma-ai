import { useQueryClient } from '@tanstack/react-query';

import type {
	CreateNotificationDto,
	GetNotificationsQuery,
	GetNotificationsResponse,
	ServerDataFormat
} from '@prisma-ai/shared';
import { useCustomMutation, useCustomQuery } from '../../query/config';
import { MANAGE_QUERY_KEY } from '../../query/keys';
import { instance } from '../config';

/**
 * 获取通知列表（管理员视角）
 * @param query 查询参数
 */
export const useGetNotificationsAdmin = (query: GetNotificationsQuery) => {
	return useCustomQuery<GetNotificationsResponse>(
		[MANAGE_QUERY_KEY.NOTIFICATIONS_ADMIN, query],
		async () => {
			const res = await instance.get<ServerDataFormat<GetNotificationsResponse>>(
				'/manage/notifications',
				{
					params: query
				}
			);
			return res.data;
		}
	);
};

/**
 * 创建通知
 */
export const useCreateNotification = () => {
	const queryClient = useQueryClient();
	return useCustomMutation(
		async (data: CreateNotificationDto) => {
			const res = await instance.post<CreateNotificationDto, ServerDataFormat<void>>(
				'/manage/notifications',
				data
			);
			return res.data;
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: [MANAGE_QUERY_KEY.NOTIFICATIONS_ADMIN] });
			}
		}
	);
};
