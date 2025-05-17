import { useCustomQuery } from '.';

type ProjectFilters = {
	status?: string;
	search?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
};

export function useProject<TResponseData>(filters?: ProjectFilters) {
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
