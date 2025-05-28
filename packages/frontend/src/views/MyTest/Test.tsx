import React from 'react';
import { ProjectCard } from '../Main/components/ProjectCard';

interface TestProps {}

export const Test: React.FC<TestProps> = props => {
	return (
		<>
			<ProjectCard
				data={{
					name: 'UI 组件库',
					createdAt: '2023-10-01',
					updatedAt: '2023-10-15',
					score: 70,
					problem: ['罗列常见技术和业务,亮点不突出', '缺乏团队贡献方面和技术方面的亮点'],
					solution: ['评估改进亮点部分', '挖掘团队贡献和技术亮点、难点']
				}}
			></ProjectCard>
		</>
	);
};
