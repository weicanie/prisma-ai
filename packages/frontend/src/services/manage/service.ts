import type { ServerDataFormat, WebsiteStatusVo } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useCustomMutation, useCustomQuery } from '../../query/config';
import { MANAGE_QUERY_KEY } from '../../query/keys';
import { instance } from '../config';

/**
 * 获取网站服务状态
 */
export const useGetWebsiteStatus = () => {
	return useCustomQuery<WebsiteStatusVo>(
		[MANAGE_QUERY_KEY.SERVICE_STATUS],
		async () => {
			const res = await instance.get<ServerDataFormat<WebsiteStatusVo>>('/manage/service/status');
			return res.data;
		},
		{
			refetchInterval: 10 * 1000 // 10秒轮询一次
		}
	);
};

/**
 * 更新网站服务状态
 */
export const useUpdateWebsiteStatus = () => {
	const queryClient = useQueryClient();
	return useCustomMutation(
		async (status: 'online' | 'maintenance') => {
			const res = await instance.put<{ status: string }, ServerDataFormat<void>>(
				'/manage/service/status',
				{ status }
			);
			return res.data;
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: [MANAGE_QUERY_KEY.SERVICE_STATUS] });
			}
		}
	);
};
