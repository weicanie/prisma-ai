import type {
	GetUsersQuery,
	GetUsersResponse,
	ServerDataFormat,
	ViolationVo
} from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useCustomMutation, useCustomQuery } from '../../query/config';
import { MANAGE_QUERY_KEY } from '../../query/keys';
import { instance } from '../config';

/**
 * 获取用户列表
 * @param query 查询参数
 */
export const useGetUsers = (query: GetUsersQuery) => {
	return useCustomQuery<GetUsersResponse>([MANAGE_QUERY_KEY.USERS, query], async () => {
		const res = await instance.get<ServerDataFormat<GetUsersResponse>>('/manage/users', {
			params: query
		});
		return res.data;
	});
};

/**
 * 封禁用户
 */
export const useBanUser = () => {
	const queryClient = useQueryClient();
	return useCustomMutation(
		async (data: { userId: number; reason?: string }) => {
			const res = await instance.post<object, ServerDataFormat<void>>('/manage/users/ban', data);
			return res.data;
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: [MANAGE_QUERY_KEY.USERS] });
			}
		}
	);
};

/**
 * 解封用户
 */
export const useUnbanUser = () => {
	const queryClient = useQueryClient();
	return useCustomMutation(
		async (userId: number) => {
			const res = await instance.post<object, ServerDataFormat<void>>('/manage/users/unban', {
				userId
			});
			return res.data;
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: [MANAGE_QUERY_KEY.USERS] });
			}
		}
	);
};

export const useGetViolations = (userId: number) => {
	return useCustomQuery(
		[MANAGE_QUERY_KEY.USERS, userId, 'violations'],
		async () => {
			const res = await instance.get<ServerDataFormat<ViolationVo[]>>('/manage/users/violations', {
				params: { userId }
			});
			return res.data;
		},
		{ enabled: !!userId } // 仅当userId存在时才执行查询
	);
};

export const useRecordViolation = () => {
	const queryClient = useQueryClient();
	return useCustomMutation(
		async (data: { userId: number; type: string; description?: string }) => {
			const res = await instance.post<object, ServerDataFormat<void>>(
				'/manage/users/violation',
				data
			);
			return res.data;
		},
		{
			onSuccess: (_, variables) => {
				queryClient.invalidateQueries({
					queryKey: [MANAGE_QUERY_KEY.USERS, variables.userId, 'violations']
				});
			}
		}
	);
};
