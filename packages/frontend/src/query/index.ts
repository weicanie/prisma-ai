import {
	type MutationFunction,
	type QueryFunction,
	type QueryKey,
	type UseMutationOptions,
	type UseMutationResult,
	type UseQueryOptions,
	useMutation,
	useQuery
} from '@tanstack/react-query';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { ServerDataFormat as SDF } from '../services/config/types';
/** 固定一些配置 并提供统一的错误处理
 *
 * @param queryKey
 * @param queryFn
 * @param options 可覆盖默认配置
 * @returns
 */
export function useCustomQuery<SD>( //SD: Response Data
	queryKey: QueryKey,
	queryFn: QueryFunction<SDF<SD>>,
	options?: Partial<UseQueryOptions<SDF<SD>>>
) {
	const navigate = useNavigate();
	//避免处理错误处理的select被覆盖
	let outerSelect: ((data: SDF<SD>) => SDF<SD>) | undefined;
	if (options?.select) {
		outerSelect = options.select;
	}
	return useQuery({
		queryKey,
		queryFn,
		staleTime: 5 * 60 * 1000,
		retry: (failureCount, error) => {
			return failureCount < 3;
		},
		...options,
		/* 统一的错误处理	 
      服务器始终会响应数据,通过code来判断错误
    */
		select: (data: SDF<SD>) => {
			//需要登录时则重定向
			if (data.code !== '0') {
				if (data.code === '2006' || data.code === '2007') {
					localStorage.removeItem('token');
					localStorage.removeItem('userInfo');
					message.warning(data.code === '2006' ? '登录已过期，请重新登录' : '请先登录');
					navigate('/login');
				} else {
					message.error(data.message || '系统繁忙，请稍后再试');
				}
			}
			if (outerSelect) {
				return outerSelect(data);
			}
			return data;
		}
	});
}

/**
 * 固定一些配置并提供统一的错误处理
 *
 * @param mutationFn 变更操作函数
 * @param options 可覆盖默认配置
 * @returns mutation对象
 */
export function useCustomMutation<TData, TVariables, TContext = unknown>(
	mutationFn: MutationFunction<SDF<TData>, TVariables>,
	options?: Partial<UseMutationOptions<SDF<TData>, unknown, TVariables, TContext>>
): UseMutationResult<SDF<TData>, unknown, TVariables, TContext> {
	const navigate = useNavigate();
	//避免处理错误处理的select被覆盖
	const outerOnSuccess = options?.onSuccess;
	const outerOnError = options?.onError;
	return useMutation({
		// 重试逻辑
		retry: (failureCount, error) => {
			return failureCount < 2; // 最多重试2次
		},
		retryDelay: attemptCount => {
			return Math.min(1000 * 2 ** attemptCount, 30000); // 最长延迟30秒
		},
		mutationFn,
		...options,
		/* 统一的错误处理	 
      服务器始终会响应数据,通过code来判断错误
    */
		onSuccess: (data, variables, context) => {
			if (data.code !== '0') {
				if (data.code === '2006' || data.code === '2007') {
					localStorage.removeItem('token');
					localStorage.removeItem('userInfo');
					message.warning(data.code === '2006' ? '登录已过期，请重新登录' : '请先登录');
					navigate('/login');
					return;
				} else {
					message.error(data.message || '系统繁忙，请稍后再试');
				}
			} else {
				if (outerOnSuccess) {
					outerOnSuccess(data, variables, context);
				}
			}
		},

		// 处理其它错误（如网络错误）
		onError: (error, variables, context) => {
			message.error('系统繁忙，请稍后再试');

			if (outerOnError) {
				outerOnError(error, variables, context);
			}
		}
	});
}
