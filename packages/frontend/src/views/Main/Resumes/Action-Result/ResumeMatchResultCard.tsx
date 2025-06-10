import { useTheme } from '@/utils/theme';
import { type ResumeMatchedDto, type ResumeVo } from '@prism-ai/shared';
import React from 'react';
import { OriginalResume } from './OriginalResume';

interface ResumeMatchResultCardProps {
	resultData: ResumeMatchedDto | null;
	resumeData: ResumeVo;
}

/**
 * 简历-岗位匹配结果卡片
 * @description 展示AI对简历的分析和岗位匹配结果
 */
export const ResumeMatchResultCard: React.FC<ResumeMatchResultCardProps> = ({
	resultData,
	resumeData
}) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	const isDataValid = (data: unknown): data is ResumeMatchedDto => {
		if (data === null || typeof data !== 'object') {
			return false;
		}
		return 'skill' in data && 'projects' in data;
	};

	if (!isDataValid(resultData)) {
		return (
			<div className="text-center text-gray-500 py-10">
				<p>未能找到匹配的岗位或返回数据格式不正确。</p>
				<p>请稍后重试或优化您的简历。</p>
			</div>
		);
	}

	const resultDataVo: ResumeVo = {
		...resumeData,
		skill: resumeData.skill,
		projects: resumeData.projects
	};

	return (
		<>
			<OriginalResume resumeData={resultDataVo} isDark={isDark} />
		</>
	);
};
