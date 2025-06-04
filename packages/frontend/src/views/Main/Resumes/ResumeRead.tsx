import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import { ArrowRight, Briefcase, Code, FileText } from 'lucide-react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCustomQuery } from '../../../query/config';
import { ResumeQueryKey } from '../../../query/keys';
import { findAllUserResumes } from '../../../services/resume';

interface ResumeReadProps {}

export const ResumeRead: React.FC<ResumeReadProps> = ({}) => {
	const { resumeIndex } = useParams();
	const { data, status } = useCustomQuery([ResumeQueryKey.Resumes, 1, 10], ({ queryKey }) => {
		const [, page, limit] = queryKey; // 从 queryKey 中解构分页参数
		return findAllUserResumes(page as number, limit as number);
	});

	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	if (status === 'pending') {
		return <div>Loading...</div>;
	}
	if (status === 'error') {
		return <div>错误:{data?.message}</div>;
	}
	const resumeDatas = data.data.data;
	const resumeData = resumeDatas?.[+resumeIndex!];

	if (!resumeData || resumeIndex === undefined) {
		return <div className="text-center text-gray-500">没有找到简历数据</div>;
	}

	return (
		<div className={`min-h-screen transition-colors duration-200 bg-global`}>
			<div className="container mx-auto px-4 pb-8">
				{/* 简历基本信息 */}
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
						</CardDescription>
					</CardHeader>
				</Card>

				{/* 职业技能信息 */}
				{resumeData.skill && resumeData.skill.content && (
					<Card
						className={`mb-6 ${
							isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
						} transition-colors duration-200`}
					>
						<CardHeader>
							<CardTitle
								className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								<Code className="w-5 h-5" />
								职业技能
							</CardTitle>
						</CardHeader>
						<CardContent>
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
						</CardContent>
					</Card>
				)}

				{/* 项目经验信息 */}
				{resumeData.projects && resumeData.projects.length > 0 && (
					<Card
						className={`${
							isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
						} transition-colors duration-200`}
					>
						<CardHeader>
							<CardTitle
								className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								<Briefcase className="w-5 h-5" />
								项目经验
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{resumeData.projects.map((project, index) => (
									<div
										key={project.id || index}
										className={`p-4 rounded-lg border ${
											isDark ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'
										}`}
									>
										{/* 项目标题和状态 */}
										<div className="flex items-center justify-between mb-3">
											<h4
												className={`font-medium text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}
											>
												{project.name || project.info?.name || '未命名项目'}
											</h4>
											<Badge
												variant={project.status === 'accepted' ? 'default' : 'secondary'}
												className="text-xs"
											>
												{project.status}
											</Badge>
										</div>

										{/* 项目基本信息 */}
										{project.info && (
											<div className="mb-4">
												{/* 项目描述 */}
												{project.info.desc && (
													<div className="mb-3">
														{project.info.desc.bgAndTarget && (
															<div className="mb-2">
																<span
																	className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} block mb-1`}
																>
																	项目背景：
																</span>
																<p
																	className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
																>
																	{project.info.desc.bgAndTarget}
																</p>
															</div>
														)}

														{project.info.desc.role && (
															<div className="mb-2">
																<span
																	className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} block mb-1`}
																>
																	担任角色：
																</span>
																<p
																	className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
																>
																	{project.info.desc.role}
																</p>
															</div>
														)}

														{project.info.desc.contribute && (
															<div className="mb-2">
																<span
																	className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} block mb-1`}
																>
																	核心贡献：
																</span>
																<p
																	className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
																>
																	{project.info.desc.contribute}
																</p>
															</div>
														)}
													</div>
												)}

												{/* 技术栈 */}
												{project.info.techStack && project.info.techStack.length > 0 && (
													<div className="mb-3">
														<span
															className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} block mb-2`}
														>
															技术栈：
														</span>
														<div className="flex flex-wrap gap-1">
															{project.info.techStack.map((tech, techIndex) => (
																<Badge key={techIndex} variant="outline" className="text-xs">
																	{tech}
																</Badge>
															))}
														</div>
													</div>
												)}
											</div>
										)}

										{/* 项目亮点 */}
										{project.lightspot && (
											<div className="mb-3">
												<span
													className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} block mb-2`}
												>
													项目亮点：
												</span>
												<div className="space-y-2">
													{project.lightspot.team && project.lightspot.team.length > 0 && (
														<div>
															<span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
																团队贡献：
															</span>
															<div className="flex flex-wrap gap-1 mt-1">
																{project.lightspot.team.map((item, idx) => (
																	<div
																		key={idx}
																		className={`flex items-start gap-2 ${
																			isDark ? 'text-gray-400' : 'text-gray-600'
																		}`}
																	>
																		<ArrowRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
																		<span>{typeof item === 'string' ? item : item.content}</span>
																	</div>
																))}
															</div>
														</div>
													)}

													{project.lightspot.skill && project.lightspot.skill.length > 0 && (
														<div>
															<span className="text-xs text-green-600 dark:text-green-400 font-medium">
																技术亮点：
															</span>
															<div className="flex flex-wrap gap-1 mt-1">
																{project.lightspot.skill.map((item, idx) => (
																	<div
																		key={idx}
																		className={`flex items-start gap-2 ${
																			isDark ? 'text-gray-400' : 'text-gray-600'
																		}`}
																	>
																		<ArrowRight className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
																		<span>{typeof item === 'string' ? item : item.content}</span>
																	</div>
																))}
															</div>
														</div>
													)}

													{project.lightspot.user && project.lightspot.user.length > 0 && (
														<div>
															<span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
																用户价值：
															</span>
															<div className="flex flex-wrap gap-1 mt-1">
																{project.lightspot.user.map((item, idx) => (
																	<div
																		key={idx}
																		className={`flex items-start gap-2 ${
																			isDark ? 'text-gray-400' : 'text-gray-600'
																		}`}
																	>
																		<ArrowRight className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
																		<span>{typeof item === 'string' ? item : item.content}</span>
																	</div>
																))}
															</div>
														</div>
													)}
												</div>
											</div>
										)}

										{/* 项目时间 */}
										<div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
											{project.createdAt && (
												<span>创建于 {new Date(project.createdAt).toLocaleDateString()}</span>
											)}
											{project.updatedAt && project.createdAt !== project.updatedAt && (
												<span> · 更新于 {new Date(project.updatedAt).toLocaleDateString()}</span>
											)}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
};
