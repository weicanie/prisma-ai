import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type ProjectVo } from '@prisma-ai/shared';
import { ArrowRight, Code, Lightbulb, Sparkles, Target, Users } from 'lucide-react';
import React from 'react';
import ClickCollapsible from '../../../components/ClickCollapsible';
import MilkdownEditor from '../../../components/Editor';
import { StatusBadge } from '../../../components/StatusBadge';
import { ProjectAnalysisResultCard } from './ProjectResult/ProjectLResultCard';

interface OriginalProjectProps {
	projectData: ProjectVo;
	isDark: boolean;
	showAnalysis?: boolean; //是否展示分析结果
}

export const OriginalProject: React.FC<OriginalProjectProps> = ({
	projectData,
	isDark,
	showAnalysis = true
}) => {
	return (
		<>
			<Card
				className={`max-h-[calc(100vh-150px)] overflow-auto scb-thin  ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
			>
				<CardHeader>
					<CardTitle
						className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
					>
						<Target className="w-5 h-5" />
						项目经验
					</CardTitle>
					<CardDescription className={`flex gap-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
						<h1 className="font-bold">{projectData.name}</h1>
						<StatusBadge status={projectData.status} type="project" />
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* 项目描述 */}
					<div className="space-y-4">
						{projectData.info.desc.role && (
							<div>
								<h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
									角色职责
								</h4>
								<p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									{projectData.info.desc.role}
								</p>
							</div>
						)}

						{projectData.info.desc.contribute && (
							<div>
								<h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
									核心贡献
								</h4>
								<p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									{projectData.info.desc.contribute}
								</p>
							</div>
						)}

						{projectData.info.desc.bgAndTarget && (
							<div>
								<h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
									项目背景
								</h4>
								<p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									{projectData.info.desc.bgAndTarget}
								</p>
							</div>
						)}
					</div>

					<Separator />

					{/* 技术栈 */}
					{projectData.info.techStack?.length > 0 && (
						<div>
							<h4
								className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
							>
								<Code className="w-4 h-4" />
								技术栈
							</h4>
							<div className="flex flex-wrap gap-2">
								{projectData.info.techStack.map((tech, index) => (
									<Badge
										key={index}
										variant="outline"
										className={`${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
									>
										{tech}
									</Badge>
								))}
							</div>
						</div>
					)}

					<Separator />

					{/* 项目亮点 */}
					{projectData.lightspot && (
						<>
							<ClickCollapsible
								title={
									<h4
										className={`font-semibold text-lg mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
									>
										<Sparkles className="w-5 h-5" />
										项目亮点
									</h4>
								}
								defaultOpen={false}
							>
								<div>
									<div className="space-y-4">
										{projectData.lightspot.team?.length > 0 && (
											<div>
												<h5
													className={`font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
												>
													<Users className="w-4 h-4" />
													团队贡献
												</h5>
												<ul className="space-y-1">
													{projectData.lightspot.team.map((item, index) => (
														<li
															key={index}
															className={`flex items-start gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
														>
															<ArrowRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
															<span>{item}</span>
														</li>
													))}
												</ul>
											</div>
										)}

										{projectData.lightspot.skill?.length > 0 && (
											<div>
												<h5
													className={`font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}
												>
													<Code className="w-4 h-4" />
													技术亮点
												</h5>
												<ul className="space-y-1">
													{projectData.lightspot.skill.map((item, index) => (
														<li
															key={index}
															className={`flex items-start gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
														>
															<ArrowRight className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
															<span>{item}</span>
														</li>
													))}
												</ul>
											</div>
										)}

										{projectData.lightspot.user?.length > 0 && (
											<div>
												<h5
													className={`font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
												>
													<Target className="w-4 h-4" />
													用户价值
												</h5>
												<ul className="space-y-1">
													{projectData.lightspot.user.map((item, index) => (
														<li
															key={index}
															className={`flex items-start gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
														>
															<ArrowRight className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
															<span>{item}</span>
														</li>
													))}
												</ul>
											</div>
										)}
									</div>
								</div>
							</ClickCollapsible>
							{/* 项目经验分析结果 */}
							{projectData.lookupResult && showAnalysis && (
								<>
									<Separator />
									<ProjectAnalysisResultCard
										isDark={isDark}
										resultData={projectData.lookupResult}
										handleFeedback={() => {}}
									/>
								</>
							)}
						</>
					)}

					{/* 业务分析 */}
					{projectData.business?.lookup && (
						<>
							<Separator />
							<ClickCollapsible
								title={
									<h4
										className={`font-semibold text-lg mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
									>
										<Lightbulb className="w-5 h-5 text-yellow-500" />
										业务分析
									</h4>
								}
								defaultOpen={true}
							>
								<CardContent className="space-y-6">
									<MilkdownEditor
										type="show"
										isCardMode={true}
										mdSelector={() => projectData.business?.lookup || ''}
									/>
								</CardContent>
							</ClickCollapsible>
						</>
					)}

					{/* 业务文档 */}
					{projectData.business?.paper && (
						<>
							<Separator />
							<ClickCollapsible
								title={
									<h4
										className={`font-semibold text-lg mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
									>
										<Lightbulb className="w-5 h-5 text-yellow-500" />
										业务文档
									</h4>
								}
								defaultOpen={true}
							>
								<CardContent className="space-y-6">
									<MilkdownEditor
										type="show"
										isCardMode={true}
										mdSelector={() => projectData.business?.paper || ''}
									/>
								</CardContent>
							</ClickCollapsible>
						</>
					)}
				</CardContent>
			</Card>
		</>
	);
};
