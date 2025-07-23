import { useTheme } from '@/utils/theme';
import { type ResumeMatchedDto, type ResumeVo } from '@prisma-ai/shared';
import React, { useState } from 'react';
import { OriginalResume } from './OriginalResume';
import type { ResumeResultProps } from './ResumeResult';

import { Button } from '@/components/ui/button';
import { Pyramid } from 'lucide-react';
import FeedBack from '../../Projects/components/FeedBack';
type ResumeMatchResultCardProps = Pick<
	ResumeResultProps,
	'resultData' | 'resumeData' | 'handleMerge' | 'handleFeedback'
>;

/**
 * 简历-岗位匹配结果卡片
 * @description 展示AI对简历的分析和岗位匹配结果
 */
export const ResumeMatchResultCard: React.FC<ResumeMatchResultCardProps> = ({
	resultData,
	resumeData,
	handleMerge,
	handleFeedback
}) => {
	console.log('🚀 ~ resultData:', resultData);
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';
	const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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
			</div>
		);
	}

	const resultDataVo: ResumeVo = {
		...resumeData,
		skill: { ...resumeData.skill, content: resultData.skill.content },
		projects: resumeData.projects.map((project, index) => ({
			...project,
			info: resultData?.projects?.[index]?.info ?? resumeData.projects[index].info,
			lightspot: resultData?.projects?.[index]?.lightspot ?? resumeData.projects[index].lightspot
		}))
	};
	return (
		<>
			<OriginalResume resumeData={resultDataVo} isDark={isDark} />
			{resultData && (
				<div className="flex justify-center items-center gap-4 fixed bottom-5 right-1/2 translate-x-1/2">
					<Button onClick={handleMerge} variant="default" className="w-40" size="lg">
						<Pyramid className="w-4 h-4 mr-2" />
						满意,完成优化
					</Button>
					<Button
						onClick={() => setIsFeedbackOpen(true)}
						variant="outline"
						className="w-40"
						size="lg"
					>
						<Pyramid className="w-4 h-4 mr-2" />
						不满意,重新优化
					</Button>
				</div>
			)}
			<FeedBack open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} onSubmit={handleFeedback} />
		</>
	);
};
