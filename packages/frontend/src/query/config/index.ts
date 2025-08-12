import { DEFAULT_MESSAGE, type ServerDataFormat as SDF } from '@prisma-ai/shared';
import {
	type MutationFunction,
	type QueryFunction,
	type QueryKey,
	type UseMutationOptions,
	type UseMutationResult,
	type UseQueryOptions,
	useMutation,
	useQuery,
	useQueryClient
} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * 用于管理toast的队列, 避免重试导致重复显示相同的toast
 */
enum ToastType {
	Success = 'success',
	Error = 'error',
	Warning = 'warning',
	Info = 'info'
}
const toastQueue = new Set<string>();
let curTimer: NodeJS.Timeout | null = null;
function addToastToQueue(message: string, type: ToastType = ToastType.Success) {
	if (toastQueue.has(JSON.stringify({ message, type }))) {
		return;
	}
	toastQueue.add(JSON.stringify({ message, type }));
	if (curTimer) {
		clearTimeout(curTimer);
	}
	curTimer = setTimeout(() => {
		for (const msg of toastQueue) {
			const { message, type } = JSON.parse(msg);
			toast[type as ToastType](message);
		}
		toastQueue.clear();
		curTimer = null;
	}, 500);
}

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
	const client = useQueryClient();
	//避免处理错误处理的select被覆盖
	let outerSelect: ((data: SDF<SD>) => SDF<SD>) | undefined;
	if (options?.select) {
		outerSelect = options.select;
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
					if (!data.message || data.message == DEFAULT_MESSAGE) {
						addToastToQueue(
							data.code === '2006' ? '登录已过期，请重新登录' : '请先登录',
							ToastType.Warning
						);
					}
					/**
					 * 清除之前用户的所有缓存。
					 * 注意：因为后端API统一返回结果，因此错误也会被缓存，这会导致token过期失效后卡在登录页面——不断获得缓存中的未登录错误，从而不断删除获得的token并请求登录。
					 * 缓存未登录错误的接口难以确定，通过清除所有缓存来解决此问题才是正确的，因为换号登录本该让所有缓存失效，否则用户获取到的是上一登录账户的数据。
					 */
					client.clear();
					navigate('/login');
				} else {
					addToastToQueue(data.message || '系统繁忙，请稍后再试', ToastType.Error);
					throw new Error(data.message);
				}
			}
			/* 返回默认的'ok'时，不显示toast，交给外部组件来决定toast */
			if (data.message && data.message !== DEFAULT_MESSAGE) {
				addToastToQueue(data.message, ToastType.Success);
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
): UseMutationResult<SDF<TData>, unknown, TVariables, TContext> {
	const navigate = useNavigate();
	const client = useQueryClient();
	//避免处理错误处理的select被覆盖
	const outerOnSuccess = options?.onSuccess;
	const outerOnError = options?.onError;
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
					if (!data.message || data.message == DEFAULT_MESSAGE) {
						addToastToQueue(
							data.code === '2006' ? '登录已过期，请重新登录' : '请先登录',
							ToastType.Warning
						);
					}
					client.clear();
					navigate('/login');
					return;
				} else {
					addToastToQueue(data.message || '系统繁忙，请稍后再试', ToastType.Error);
					throw new Error(data.message); //触发组件设置的onError回调
				}
			} else {
				/* 返回默认的'ok'时，不显示toast，交给外部组件来决定toast */
				if (data.message && data.message !== DEFAULT_MESSAGE) {
					addToastToQueue(data.message, ToastType.Success);
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
