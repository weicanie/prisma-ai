import { DEFAULT_MESSAGE, type ServerDataFormat as SDF } from '@prism-ai/shared';
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
	//避免处理错误处理的select被覆盖
	let outerSelect: ((data: SDF<SD>) => SDF<SD>) | undefined;
	if (options?.select) {
		outerSelect = options.select;
	}
	return useQuery({
		queryKey,
		queryFn,
		staleTime: 1 * 60 * 1000, //1分钟后过时
		retry: failureCount => {
			return failureCount < 2;
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
					addToastToQueue(
						data.code === '2006' ? '登录已过期，请重新登录' : '请先登录',
						ToastType.Warning
					);
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
	//避免处理错误处理的select被覆盖
	const outerOnSuccess = options?.onSuccess;
	const outerOnError = options?.onError;
	return useMutation({
		// 重试逻辑
		retry: failureCount => {
			return failureCount < 2; // 最多试2次
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
					addToastToQueue(
						data.code === '2006' ? '登录已过期，请重新登录' : '请先登录',
						ToastType.Warning
					);
					navigate('/login');
					return;
				} else {
					addToastToQueue(data.message || '系统繁忙，请稍后再试', ToastType.Error);
					throw new Error(data.message);
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

		// 处理其它错误（如网络错误）
		onError: (error, variables, context) => {
			addToastToQueue(`系统繁忙，请稍后再试${error}`, ToastType.Error);

			if (outerOnError) {
				outerOnError(error, variables, context);
			}
		}
	});
}
