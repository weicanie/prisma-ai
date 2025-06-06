import { Badge } from '@/components/ui/badge';
import { ProjectStatus } from '@prism-ai/shared';
import React from 'react';

interface StatusBadgeProps {
	status: `${ProjectStatus}`;
}
/* 项目状态徽标 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
	const statusMap = {
		[ProjectStatus.committed]: '初提交-大橘未定',
		[ProjectStatus.lookuped]: '已分析-连携看破',
		[ProjectStatus.polishing]: '初露锋芒',
		[ProjectStatus.polished]: '已优化-寒气练成',
		[ProjectStatus.mining]: '雪花沉睡',
		[ProjectStatus.mined]: '已挖掘-黄金奖杯',
		[ProjectStatus.accepted]: 'Agent-指引明路'
	};

	const colorMap = {
		[ProjectStatus.committed]: 'bg-amber-400',
		[ProjectStatus.lookuped]: 'bg-amber-600',
		[ProjectStatus.polished]: 'bg-purple-400',
		[ProjectStatus.mined]: 'bg-blue-400',
		[ProjectStatus.accepted]: 'bg-blue-200'
	};
	const getStatusText = (status: `${ProjectStatus}`) => {
		return statusMap[status] || '未知状态';
	};

	const getStatusColor = (status: `${ProjectStatus}`) => {
		//@ts-ignore
		if (colorMap.hasOwnProperty(status)) return colorMap[status];
		return 'bg-blue-500';
	};

	return (
		<>
			<Badge className={getStatusColor(status)}>{getStatusText(status)}</Badge>
		</>
	);
};
