import type { ProjectExperience } from '@prism-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useCustomMutation } from '.';
import { uploadProjectRaw, uploadProjectText } from '../services/project';
type ProjectFilters = {
	name: string;
	status?: string;
};

//! useMutation就不要模块化了

// 用于上传完整的项目经验json（初始的、最终的）
export function useUploadProject(filters?: ProjectFilters) {
	const queryClient = useQueryClient();
	return useCustomMutation<ProjectExperience, ProjectExperience>(uploadProjectRaw, {
		onSuccess(data, variables, context) {
			//直接更新对应缓存
			queryClient.setQueryData(['projects', filters], data);
			//连带更新相关缓存
			queryClient.invalidateQueries({ queryKey: ['projects', filters] });
		}
	});
}
// 用于上传项目经验文本
export function useUploadProjectText(filters?: ProjectFilters) {
	const queryClient = useQueryClient();
	return useCustomMutation<ProjectExperience, string>(uploadProjectText, {
		onSuccess(data) {
			queryClient.setQueryData(['projects', filters], data);
			queryClient.invalidateQueries({ queryKey: ['projects', filters] });
		}
	});
}
