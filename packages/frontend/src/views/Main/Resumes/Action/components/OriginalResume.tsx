import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ResumeVo } from '@prisma-ai/shared';
import { Code, FileText } from 'lucide-react';
import React, { Fragment } from 'react';
import ClickCollapsible from '../../../components/ClickCollapsible';
import { StatusBadge } from '../../../components/StatusBadge';
import { OriginalProject } from '../../../Projects/Action/components/OriginalProject';

interface OriginalResumeProps {
	resumeData: ResumeVo;
	isDark: boolean;
}

/**
 * 简历信息展示组件
 * @description 用于在操作页面的左侧展示用户简历的详细信息、在右侧展示定制后的简历
 *
 */
export const OriginalResume: React.FC<OriginalResumeProps> = ({ resumeData, isDark }) => {
	return (
		<Card
			className={`mb-6 ${
				isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
			} transition-colors duration-200`}
		>
			<CardHeader>
				<CardTitle
					className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}
				>
					<FileText className="w-6 h-6" />
					{resumeData.name}
				</CardTitle>
				<CardDescription className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
					创建于{' '}
					{resumeData.createdAt ? new Date(resumeData.createdAt).toLocaleDateString() : '未知'}
					{resumeData.updatedAt && (
						<> · 更新于 {new Date(resumeData.updatedAt).toLocaleDateString()}</>
					)}
					<>
						<StatusBadge status={resumeData.status} type="resume" className="ml-2" />
					</>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* 职业技能信息 */}
				{resumeData.skill && resumeData.skill.content && (
					<>
						<CardHeader className="p-0">
							<CardTitle
								className={`flex items-center gap-2 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								<Code className="size-5" />
								职业技能
							</CardTitle>
						</CardHeader>
						<div className="space-y-4">
							{resumeData.skill.content.map((skillGroup, index) => (
								<div key={index}>
									<h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
										{skillGroup.type}
									</h4>
									<div className="flex flex-wrap gap-2">
										{skillGroup.content?.map((skill, skillIndex) => (
											<Badge
												key={skillIndex}
												variant="secondary"
												className={`${
													isDark
														? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
														: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
												}`}
											>
												{skill}
											</Badge>
										))}
									</div>
								</div>
							))}
						</div>
					</>
				)}

				{/* 项目经验信息 */}
				{resumeData.projects &&
					resumeData.projects.length > 0 &&
					resumeData.projects.map((project, index) => (
						<Fragment key={project.id}>
							<ClickCollapsible
								title={<h2 className="text-lg font-bold">{project.name}</h2>}
								icon={<FileText className="size-5" />}
							>
								<OriginalProject
									key={index}
									projectData={project}
									isDark={isDark}
									showAnalysis={false}
								/>
							</ClickCollapsible>
						</Fragment>
					))}
			</CardContent>
		</Card>
	);
};
