import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useCustomQuery } from '../../../query/config';
import { UserMemoryQueryKey } from '../../../query/keys';
import { getUserMemory } from '../../../services/user_memory';

const UserMemoryRead: React.FC = () => {
	const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);

	const { data, status } = useCustomQuery([UserMemoryQueryKey.UserMemory], getUserMemory);

	if (status === 'pending') return <div className="p-4">加载中...</div>;
	if (status === 'error') return <div className="p-4 text-red-600">加载失败: {data?.message}</div>;

	const userMemory = data?.data;

	if (!userMemory) return <div className="text-center text-gray-500 p-4">没有找到用户记忆数据</div>;

	// 复制JSON到剪贴板的函数
	const copyJsonToClipboard = async () => {
		try {
			const jsonString = JSON.stringify(userMemory, null, 2);
			await navigator.clipboard.writeText(jsonString);
			toast.success('JSON已复制到剪贴板');
			setIsJsonDialogOpen(false);
		} catch (error) {
			toast.error('复制失败');
		}
	};

	// 渲染标签数组的通用组件
	const renderBadges = (items: string[], emptyText: string = '暂无数据') => (
		<div className="flex flex-wrap gap-1">
			{items && items.length > 0 ? (
				items.map((item, index) => (
					<Badge key={index} variant="secondary" className="text-xs">
						{item}
					</Badge>
				))
			) : (
				<span className="text-gray-500 text-sm">{emptyText}</span>
			)}
		</div>
	);

	return (
		<div className="container mx-auto px-4 pb-8 max-w-6xl">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* 资历背景 */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">资历背景 (Qualifications)</CardTitle>
						<CardDescription>候选人的可量化、可验证的客观背景信息</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h4 className="font-medium mb-2">工作经验水平</h4>
							{renderBadges(userMemory.userProfile.qualifications.experience_level)}
						</div>
						<div>
							<h4 className="font-medium mb-2">学历要求</h4>
							{renderBadges(userMemory.userProfile.qualifications.education_degree)}
						</div>
						<div>
							<h4 className="font-medium mb-2">专业领域</h4>
							{renderBadges(userMemory.userProfile.qualifications.education_majors)}
						</div>
						<div>
							<h4 className="font-medium mb-2">语言能力</h4>
							{renderBadges(userMemory.userProfile.qualifications.language_proficiencies)}
						</div>
						<div>
							<h4 className="font-medium mb-2">资格证书</h4>
							{renderBadges(userMemory.userProfile.qualifications.certifications)}
						</div>
					</CardContent>
				</Card>

				{/* 能力模型 */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">能力模型 (Skills Matrix)</CardTitle>
						<CardDescription>候选人完成工作所需掌握的知识和技能集合</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h4 className="font-medium mb-2">领域/行业知识</h4>
							{renderBadges(userMemory.userProfile.skills_matrix.domain_knowledge)}
						</div>
						<div>
							<h4 className="font-medium mb-2">编程语言</h4>
							{renderBadges(userMemory.userProfile.skills_matrix.programming_languages)}
						</div>
						<div>
							<h4 className="font-medium mb-2">框架和库</h4>
							{renderBadges(userMemory.userProfile.skills_matrix.frameworks_and_libraries)}
						</div>
						<div>
							<h4 className="font-medium mb-2">工具和平台</h4>
							{renderBadges(userMemory.userProfile.skills_matrix.tools_and_platforms)}
						</div>
						<div>
							<h4 className="font-medium mb-2">软技能</h4>
							{renderBadges(userMemory.userProfile.skills_matrix.soft_skills)}
						</div>
					</CardContent>
				</Card>

				{/* 职责范围 */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">职责范围 (Responsibilities)</CardTitle>
						<CardDescription>候选人过往经历中应体现出的工作内容和项目特征</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h4 className="font-medium mb-2">核心职责</h4>
							{renderBadges(userMemory.userProfile.responsibilities.primary_duties)}
						</div>
						<div>
							<h4 className="font-medium mb-2">工作/项目模式</h4>
							{renderBadges(userMemory.userProfile.responsibilities.work_methodologies)}
						</div>
						<div>
							<h4 className="font-medium mb-2">经验范围与影响力</h4>
							{renderBadges(userMemory.userProfile.responsibilities.scope_and_impact)}
						</div>
					</CardContent>
				</Card>
				{/* 求职方向部分 */}

				<Card>
					<CardHeader>
						<CardTitle className="text-lg">求职偏好 (Job Preferences)</CardTitle>
						<CardDescription>您的职业发展目标和期望</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h4 className="font-medium mb-2">职位方向</h4>
							{renderBadges(userMemory.jobSeekDestination.jobType)}
						</div>
						<div>
							<h4 className="font-medium mb-2">职位名称</h4>
							{renderBadges(userMemory.jobSeekDestination.jobName)}
						</div>
						<div>
							<h4 className="font-medium mb-2">目标行业</h4>
							{renderBadges(userMemory.jobSeekDestination.industry)}
						</div>
						<div>
							<h4 className="font-medium mb-2">目标公司</h4>
							{renderBadges(userMemory.jobSeekDestination.company)}
						</div>
						<div>
							<h4 className="font-medium mb-2">期望城市</h4>
							{renderBadges(userMemory.jobSeekDestination.city)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default UserMemoryRead;
