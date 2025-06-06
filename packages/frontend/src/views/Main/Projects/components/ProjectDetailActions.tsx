import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProjectStatus, type ProjectVo } from '@prism-ai/shared';
import { Users, Wand2 } from 'lucide-react'; // Assuming lucide-react for icons
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ProjectDetailActionsProps {
	projectData: ProjectVo;
	projectIndex: string;
	isDark: boolean;
}

/**
 * 项目详情页的操作按钮组件
 * 根据项目状态，展示不同的操作按钮，例如“AI打磨”、“AI挖掘”等。
 */
export const ProjectDetailActions: React.FC<ProjectDetailActionsProps> = ({
	projectData,
	projectIndex,
	isDark
}) => {
	const navigate = useNavigate();

	// 根据项目状态判断是否可以进行AI改进
	const canImprove = [ProjectStatus.lookuped, ProjectStatus.polished, ProjectStatus.mined].includes(
		projectData.status
	);

	if (!canImprove) {
		return null; // 如果不能改进，则不渲染任何按钮
	}

	const handleNavigateToAction = () => {
		navigate(`/main/projects/action/${projectIndex}`);
	};

	return (
		<Card
			className={`mt-6 p-6 ${
				isDark
					? 'bg-gradient-to-r from-blue-900/50 to-purple-700/50 border-blue-700'
					: 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
			} transition-colors duration-200`}
		>
			<div className="space-y-4">
				<div>
					<h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
						下一步行动
					</h3>
					<p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
						利用 AI 进一步优化和挖掘您的项目经验。
					</p>
				</div>
				<div className="flex flex-col space-y-3">
					<Button
						onClick={() => handleNavigateToAction()}
						className={`${isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
					>
						<Wand2 className="mr-2 h-4 w-4" /> AI 打磨优化
					</Button>
					<Button
						onClick={() => handleNavigateToAction()}
						className={`${isDark ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-500 hover:bg-purple-600'} text-white`}
					>
						<Users className="mr-2 h-4 w-4" /> AI 挖掘亮点
					</Button>
				</div>
			</div>
		</Card>
	);
};
