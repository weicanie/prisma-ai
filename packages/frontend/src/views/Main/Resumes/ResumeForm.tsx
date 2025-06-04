import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { CreateResumeDto } from '@prism-ai/shared';
import { Code, FileText, Sparkles } from 'lucide-react';
import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { useCustomQuery } from '../../../query/config';
import { ProjectQueryKey, SkillQueryKey } from '../../../query/keys';
import { findAllProjects } from '../../../services/project';
import { findAllUserSkills } from '../../../services/skill';
import { selectResumeData } from '../../../store/resume';

const resumeFormSchema = z.object({
	name: z.string().min(1, '简历名称不能为空')
});

type ResumeFormData = z.infer<typeof resumeFormSchema>;

interface ResumeFormProps {
	onSubmit: (data: CreateResumeDto) => void;
}

// 生成默认简历名称
const generateDefaultResumeName = () => {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `我的简历-${year}-${month}-${day}`;
};

export const ResumeForm: React.FC<ResumeFormProps> = memo(({ onSubmit }) => {
	const form = useForm<ResumeFormData>({
		resolver: zodResolver(resumeFormSchema),
		defaultValues: {
			name: generateDefaultResumeName()
		}
	});

	// 从store获取选中的技能和项目
	const selectedIds = useSelector(selectResumeData);
	const selectedSkillId = selectedIds?.skill;
	const selectedProjectIds = selectedIds?.projects;

	const { data: projectData, status: projectStatus } = useCustomQuery(
		[ProjectQueryKey.Projects],
		findAllProjects
	);
	const { data: skillData, status: skillStatus } = useCustomQuery(
		[SkillQueryKey.Skills],
		findAllUserSkills
	);

	if (projectStatus === 'pending' || skillStatus === 'pending') {
		return <div>Loading...</div>;
	}

	if (projectStatus === 'error' || skillStatus === 'error') {
		return <div>错误: {projectData?.message || skillData?.message}</div>;
	}

	const selectedSkill = skillData.data.find(skill => skill.id === selectedSkillId);

	const selectedProjects = projectData.data.filter(project =>
		selectedProjectIds?.includes(project.id!)
	);

	const handleSubmit = (data: ResumeFormData) => {
		const resumeData: CreateResumeDto = {
			name: data.name,
			skill: selectedSkill?.id,
			projects: selectedProjects?.map((project: any) => project.id) || []
		};

		console.log('提交的简历数据:', resumeData);
		onSubmit(resumeData);
	};

	return (
		<div className="w-full sm:min-w-xl max-w-2xl">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					{/* 简历名称输入 */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<FileText className="w-5 h-5" />
							<h3 className="text-lg font-semibold">简历信息</h3>
						</div>

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>简历名称</FormLabel>
									<FormControl>
										<Input placeholder="请输入简历名称" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* 选中的职业技能展示 */}
					{selectedSkill && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-base">
									<Code className="w-4 h-4" />
									已选择的职业技能
								</CardTitle>
								<CardDescription>以下技能将包含在简历中</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{selectedSkill.content?.map((skillGroup: any, index: number) => (
										<div key={index}>
											<h5 className="font-medium text-sm mb-2">{skillGroup.type}</h5>
											<div className="flex flex-wrap gap-1">
												{skillGroup.content?.map((skill: string, skillIndex: number) => (
													<Badge key={skillIndex} variant="secondary" className="text-xs">
														{skill}
													</Badge>
												))}
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* 选中的项目经验展示 */}
					{selectedProjects && selectedProjects.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-base">
									<Sparkles className="w-4 h-4" />
									已选择的项目经验
								</CardTitle>
								<CardDescription>
									以下项目将包含在简历中（共{selectedProjects.length}个项目）
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{selectedProjects.map((project: any, index: number) => (
										<div
											key={project.id || index}
											className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
										>
											<div className="flex items-center justify-between mb-2">
												<h5 className="font-medium text-sm">
													{project.name || project.info?.name || '未命名项目'}
												</h5>
												<Badge variant="outline" className="text-xs">
													{project.status}
												</Badge>
											</div>

											{/* 项目背景描述 */}
											{project.info?.desc?.bgAndTarget && (
												<p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
													{project.info.desc.bgAndTarget.length > 60
														? `${project.info.desc.bgAndTarget.substring(0, 60)}...`
														: project.info.desc.bgAndTarget}
												</p>
											)}

											{/* 角色信息 */}
											{project.info?.desc?.role && (
												<p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
													角色：{project.info.desc.role}
												</p>
											)}

											{/* 技术栈 */}
											{project.info?.techStack && project.info.techStack.length > 0 && (
												<div className="flex flex-wrap gap-1 mt-2">
													{project.info.techStack
														.slice(0, 3)
														.map((tech: string, techIndex: number) => (
															<Badge key={techIndex} variant="outline" className="text-xs">
																{tech}
															</Badge>
														))}
													{project.info.techStack.length > 3 && (
														<Badge variant="secondary" className="text-xs">
															+{project.info.techStack.length - 3}
														</Badge>
													)}
												</div>
											)}

											{/* 亮点预览 */}
											{project.lightspot && (
												<div className="mt-2">
													{(project.lightspot.team?.length > 0 ||
														project.lightspot.skill?.length > 0 ||
														project.lightspot.user?.length > 0) && (
														<div className="flex flex-wrap gap-1">
															<Badge variant="secondary" className="text-xs">
																{(project.lightspot.team?.length || 0) +
																	(project.lightspot.skill?.length || 0) +
																	(project.lightspot.user?.length || 0)}{' '}
																个亮点
															</Badge>
														</div>
													)}
												</div>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* 提示信息 */}
					{!selectedSkill && (!selectedProjects || selectedProjects.length === 0) && (
						<Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
							<CardContent className="pt-6">
								<p className="text-sm text-yellow-800 dark:text-yellow-200">
									提示：当前没有选择任何技能或项目经验。
								</p>
							</CardContent>
						</Card>
					)}

					{/* 提交按钮 */}
					<div className="flex justify-end pt-4 border-t">
						<Button type="submit" className="flex items-center">
							<FileText className="w-4 h-4 mr-2" />
							创建简历
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
});
