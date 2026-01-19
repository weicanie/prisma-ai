import { DEFAULT_MESSAGE, type ServerDataFormat as SDF } from '@prisma-ai/shared';
import {
	type MutationFunction,
	type QueryFunction,
	type QueryKey,
	type UseMutationOptions,
	type UseMutationReturnType,
	type UseQueryOptions,
	useMutation,
	useQuery,
	useQueryClient
} from '@tanstack/vue-query';
import { unref } from 'vue';
import { useRouter } from 'vue-router';

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
	//@ts-expect-error 跳过复杂推断; vue中options可能是ref
	const _options = unref(options);
	const router = useRouter();
	const client = useQueryClient();
	//避免处理错误处理的select被覆盖
	let outerSelect: ((data: SDF<SD>) => SDF<SD>) | undefined;
	if (_options?.select) {
		outerSelect = unref(_options.select);
	}
	return useQuery({
		queryKey,
		queryFn,
		staleTime: 1 * 60 * 1000, //1分钟后过时
		retry: false,
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
					/**
					 * 清除之前用户的所有缓存。
					 * 注意：因为后端API统一返回结果，因此错误也会被缓存，这会导致token过期失效后卡在登录页面——不断获得缓存中的未登录错误，从而不断删除获得的token并请求登录。
					 * 缓存未登录错误的接口难以确定，通过清除所有缓存来解决此问题才是正确的，因为换号登录本该让所有缓存失效，否则用户获取到的是上一登录账户的数据。
					 */
					client.clear();
					router.push('/login');
				} else {
					throw new Error(data.message);
				}
			}
			/* 返回默认的'ok'时，不显示toast，交给外部组件来决定toast */
			if (data.message && data.message !== DEFAULT_MESSAGE) {
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
	/* 
		TData:服务器返回的data字段数据
		TVariables：请求参数
		TContext: onMutate 回调返回的对象
		TData、TVariables会根据传入的mutationFn自动推导
	*/
	mutationFn: MutationFunction<SDF<TData>, TVariables>,
	options?: Partial<UseMutationOptions<SDF<TData>, unknown, TVariables, TContext>>
): UseMutationReturnType<SDF<TData>, unknown, TVariables, TContext> {
	const _options = unref(options);
	const router = useRouter();
	const client = useQueryClient();
	//避免处理错误处理的select被覆盖
	//@ts-expect-error 跳过复杂推断
	const outerOnSuccess = unref(_options?.onSuccess);
	//@ts-expect-error 跳过复杂推断
	const outerOnError = unref(_options?.onError);
	return useMutation({
		// 重试逻辑
		retry: false,
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

					client.clear();
					router.push('/login');
					return;
				} else {
					throw new Error(data.message); //触发组件设置的onError回调
				}
			} else {
				/* 返回默认的'ok'时，不显示toast，交给外部组件来决定toast */
				if (data.message && data.message !== DEFAULT_MESSAGE) {
				}
				if (outerOnSuccess) {
					outerOnSuccess(data, variables, context);
				}
			}
		},

		// 触发组件设置的onError回调
		onError: (error, variables, context) => {
			// addToastToQueue(`系统繁忙，请稍后再试${error}`, ToastType.Error);
			if (outerOnError) {
				outerOnError(error, variables, context);
			}
		}
	});
}
