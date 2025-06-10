import { Badge } from '@/components/ui/badge';
import { ProjectStatus, ResumeStatus } from '@prism-ai/shared';
import React from 'react';

const project = {
	text: {
		[ProjectStatus.committed]: '初提交-大橘未定',
		[ProjectStatus.lookuped]: '已分析-连携看破',
		[ProjectStatus.polishing]: '初露锋芒',
		[ProjectStatus.polished]: '已优化-寒气练成',
		[ProjectStatus.mining]: '雪花沉睡',
		[ProjectStatus.mined]: '已挖掘-黄金奖杯',
		[ProjectStatus.accepted]: 'Agent-指引明路'
	},
	color: {
		[ProjectStatus.committed]: 'bg-amber-400',
		[ProjectStatus.lookuped]: 'bg-amber-600',
		[ProjectStatus.polished]: 'bg-purple-400',
		[ProjectStatus.mined]: 'bg-blue-400',
		[ProjectStatus.accepted]: 'bg-blue-200'
	}
};

const resume = {
	text: {
		[ResumeStatus.committed]: '未定制-大橘未定',
		[ResumeStatus.matched]: '已定制-指引明路'
	},
	color: {
		[ResumeStatus.committed]: 'bg-amber-400',
		[ResumeStatus.matched]: 'bg-blue-200'
	}
};

interface StatusBadgeProps {
	status: `${ProjectStatus}` | `${ResumeStatus}`;
	type: 'project' | 'resume';
	className?: string;
}
/* 项目状态徽标 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
	status,
	type = 'project',
	className
}) => {
	let statusTextMap, colorMap;

	if (type === 'project') {
		status = status as `${ProjectStatus}`;
		statusTextMap = project.text;
		colorMap = project.color;
	} else {
		status = status as `${ResumeStatus}`;
		statusTextMap = resume.text;
		colorMap = resume.color;
	}

	return (
		<>
			<Badge
				className={`${colorMap[status as keyof typeof colorMap] ?? 'bg-blue-500'} ${className}`}
			>
				{statusTextMap[status as keyof typeof statusTextMap] ?? '未知状态'}
			</Badge>
		</>
	);
};
