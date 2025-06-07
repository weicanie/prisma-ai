import {
	type MutationFunction,
	type QueryKey,
	useMutation,
	useQueryClient
} from '@tanstack/react-query';

export function useOptimisticMutation<T, TData>(
	mutationFn: MutationFunction<T, TData>,
	queryKey: QueryKey,
	updateFn: (oldData: any, newData: TData) => any
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onMutate: async newData => {
			// 取消任何进行中的重新获取，避免覆盖乐观更新
			await queryClient.cancelQueries({ queryKey });
			// 保存原来的值
			const previousData = queryClient.getQueryData(queryKey);
			// 乐观更新缓存
			queryClient.setQueryData(queryKey, (old: any) => updateFn(old, newData));
			return { previousData };
		},
		onError: (_, __, context) => {
			// 失败时回滚到先前的值
			queryClient.setQueryData(queryKey, context?.previousData);
		},
		onSettled: () => {
			// 无论成功失败都让缓存与服务器同步
			queryClient.invalidateQueries({ queryKey });
		}
	});
}
