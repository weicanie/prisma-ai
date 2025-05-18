import { useCustomQuery } from '.';

type ProjectFilters = {
	name: string;
	status?: string;
};

export function useGetProject<TResponseData>(filters?: ProjectFilters) {
	return useCustomQuery<TResponseData>(
		['projects', filters],
		// axios 进行请求
		(data: any) => {
			return data;
		},
		{
			select: data => {
				return data;
			}
		}
	);
}
export function useUploadProject<TResponseData>(filters?: ProjectFilters) {
	return useCustomQuery<TResponseData>(
		['projects', filters],
		// axios 进行请求
		(data: any) => {
			return data;
		},
		{
			select: data => {
				return data;
			}
		}
	);
}
