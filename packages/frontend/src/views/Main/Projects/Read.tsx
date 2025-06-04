import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import { ProjectStatus } from '@prism-ai/shared';
import { ArrowRight, Code, Sparkles, Target, Users } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomQuery } from '../../../query/config';
import { ProjectQueryKey } from '../../../query/keys';
import { findAllProjects } from '../../../services/project';
import { ProjectCard } from './ProjectCard';

interface ReadProps {}

export const Read: React.FC<ReadProps> = ({}) => {
	const { projectIndex } = useParams();
	const { data, status } = useCustomQuery([ProjectQueryKey.Projects], findAllProjects);
	const navigate = useNavigate();

	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	if (status === 'pending') {
		return <div>Loading...</div>;
	}
	if (status === 'error') {
		return <div>错误:{data?.message}</div>;
	}
	const projectDatas = data.data;
	const projectData = projectDatas?.[+projectIndex!];

	if (!projectData || projectIndex === undefined) {
		return <div className="text-center text-gray-500">没有找到项目经验数据</div>;
	}

	/* 项目状态徽标样式 */
	const getStatusText = (status: ProjectStatus) => {
		const statusMap = {
			[ProjectStatus.refuse]: '初来乍到',
			[ProjectStatus.committed]: '大橘未定',
			[ProjectStatus.polishing]: '初露锋芒',
			[ProjectStatus.polished]: '原初异音',
			[ProjectStatus.mining]: '雪花沉睡',
			[ProjectStatus.mined]: '寒气练成',
			[ProjectStatus.accepted]: '黄金奖杯'
		};
		return statusMap[status] || '未知状态';
	};
	const getStatusColor = (status: ProjectStatus) => {
		if (status === ProjectStatus.refuse) return 'outline';
		if (status === ProjectStatus.accepted) return 'secondary';
		return 'default';
	};
	/* 是否展示AI改进卡片 */
	const canImprove = [
		ProjectStatus.committed,
		ProjectStatus.polished,
		ProjectStatus.mined
	].includes(projectData.status);

	return (
		<div className={`py-8 min-h-screen transition-colors duration-200 bg-global`}>
			{/* 页面头部 */}
			{/* <PageHeader title="项目经验详情" description="查看和改进您的项目经验描述" /> */}

			<div className="container mx-auto px-4 pb-8">
				{/* 项目基本信息 */}
				<Card
					className={`mb-6 ${
						isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
					} transition-colors duration-200`}
				>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
								{projectData.info.name}
							</CardTitle>
							<Badge variant={getStatusColor(projectData.status)} className="text-foreground">
								{getStatusText(projectData.status)}
							</Badge>
						</div>
						<CardDescription className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
							创建于{' '}
							{projectData.createdAt
								? new Date(projectData.createdAt).toLocaleDateString()
								: '未知'}
							{projectData.updatedAt && (
								<> · 更新于 {new Date(projectData.updatedAt).toLocaleDateString()}</>
							)}
						</CardDescription>
					</CardHeader>
				</Card>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* 左侧：项目概要卡片、下一步行动 */}
					<div className="lg:col-span-1">
						<ProjectCard data={projectData} />
						{/* 下一步行动 */}
						{canImprove && (
							<Card
								className={`mt-6 ${
									isDark
										? 'bg-gradient-to-r from-blue-900/50 to-purple-700/50 border-blue-700'
										: 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
								} transition-colors duration-200`}
							>
								<CardHeader>
									<CardTitle
										className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
									>
										<Sparkles className="w-5 h-5" />
										AI 智能优化
									</CardTitle>
									<CardDescription className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
										让 AI 帮助您优化项目经验，提升简历竞争力
									</CardDescription>
								</CardHeader>{' '}
								<CardContent>
									<div className="flex flex-col gap-3">
										<Button
											onClick={() =>
												navigate(`/main/projects/action/${projectIndex}`, {
													state: { param: projectIndex }
												})
											}
											className="flex-1 min-h-10 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
											size="lg"
										>
											<Sparkles className="w-4 h-4 mr-2" />
											AI 智能优化
										</Button>
										<Button
											onClick={() =>
												navigate(`/main/projects/action/${projectIndex}`, {
													state: { param: projectIndex }
												})
											}
											variant="outline"
											className={`flex-1 min-h-10 ${
												isDark
													? 'border-gray-600 text-gray-200 hover:bg-gray-700'
													: 'border-gray-300 text-gray-700 hover:bg-gray-50'
											} cursor-pointer`}
											size="lg"
										>
											<Target className="w-4 h-4 mr-2" />
											深度挖掘亮点
										</Button>
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* 右侧：详细信息 */}
					<div className="lg:col-span-2 space-y-6">
						{/* 项目描述 */}
						<Card
							className={`${
								isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
							} transition-colors duration-200`}
						>
							<CardHeader>
								<CardTitle
									className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
								>
									<Target className="w-5 h-5" />
									项目信息
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{projectData.info.desc.role && (
									<div>
										<h4
											className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
										>
											角色职责
										</h4>
										<p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
											{projectData.info.desc.role}
										</p>
									</div>
								)}

								{projectData.info.desc.contribute && (
									<div>
										<h4
											className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
										>
											核心贡献
										</h4>
										<p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
											{projectData.info.desc.contribute}
										</p>
									</div>
								)}

								{projectData.info.desc.bgAndTarget && (
									<div>
										<h4
											className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
										>
											项目背景
										</h4>
										<p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
											{projectData.info.desc.bgAndTarget}
										</p>
									</div>
								)}

								{projectData.info.techStack?.length > 0 && (
									<div>
										<h4
											className={`font-semibold mb-2 flex items-center gap-2 ${
												isDark ? 'text-gray-200' : 'text-gray-700'
											}`}
										>
											<Code className="w-4 h-4" />
											技术栈
										</h4>
										<div className="flex flex-wrap gap-2">
											{projectData.info.techStack.map((tech, index) => (
												<Badge
													key={index}
													variant="outline"
													className={`${
														isDark
															? 'border-gray-600 text-gray-300'
															: 'border-gray-300 text-gray-700'
													}`}
												>
													{tech}
												</Badge>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* 项目亮点 */}
						{projectData.lightspot && (
							<Card
								className={`${
									isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
								} transition-colors duration-200`}
							>
								<CardHeader>
									<CardTitle
										className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
									>
										<Sparkles className="w-5 h-5" />
										项目亮点
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									{projectData.lightspot.team?.length > 0 && (
										<div>
											<h4
												className={`font-semibold mb-3 flex items-center gap-2 ${
													isDark ? 'text-blue-400' : 'text-blue-600'
												}`}
											>
												<Users className="w-4 h-4" />
												团队贡献
											</h4>
											<ul className="space-y-2">
												{projectData.lightspot.team.map((item, index) => (
													<li
														key={index}
														className={`flex items-start gap-2 ${
															isDark ? 'text-gray-400' : 'text-gray-600'
														}`}
													>
														<ArrowRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
														<span>{typeof item === 'string' ? item : item.content}</span>
													</li>
												))}
											</ul>
										</div>
									)}

									{projectData.lightspot.skill?.length > 0 && (
										<div>
											<h4
												className={`font-semibold mb-3 flex items-center gap-2 ${
													isDark ? 'text-green-400' : 'text-green-600'
												}`}
											>
												<Code className="w-4 h-4" />
												技术亮点
											</h4>
											<ul className="space-y-2">
												{projectData.lightspot.skill.map((item, index) => (
													<li
														key={index}
														className={`flex items-start gap-2 ${
															isDark ? 'text-gray-400' : 'text-gray-600'
														}`}
													>
														<ArrowRight className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
														<span>{typeof item === 'string' ? item : item.content}</span>
													</li>
												))}
											</ul>
										</div>
									)}

									{projectData.lightspot.user?.length > 0 && (
										<div>
											<h4
												className={`font-semibold mb-3 flex items-center gap-2 ${
													isDark ? 'text-purple-400' : 'text-purple-600'
												}`}
											>
												<Target className="w-4 h-4" />
												用户价值
											</h4>
											<ul className="space-y-2">
												{projectData.lightspot.user.map((item, index) => (
													<li
														key={index}
														className={`flex items-start gap-2 ${
															isDark ? 'text-gray-400' : 'text-gray-600'
														}`}
													>
														<ArrowRight className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
														<span>{typeof item === 'string' ? item : item.content}</span>
													</li>
												))}
											</ul>
										</div>
									)}
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
