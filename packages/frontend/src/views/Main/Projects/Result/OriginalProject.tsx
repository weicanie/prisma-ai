import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ProjectVo } from '@prism-ai/shared';
import { ArrowRight, Code, Sparkles, Target, Users } from 'lucide-react';
import React from 'react';

interface OriginalProjectProps {
	projectData: ProjectVo;
	isDark: boolean;
}

export const OriginalProject: React.FC<OriginalProjectProps> = ({ projectData, isDark }) => {
	return (
		<>
			<Card
				className={`h-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
			>
				<CardHeader>
					<CardTitle
						className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
					>
						<Target className="w-5 h-5" />
						原始项目信息
					</CardTitle>
					<CardDescription className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
						{projectData.info.name}
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
						<div>
							<h4
								className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								<Sparkles className="w-5 h-5" />
								项目亮点
							</h4>
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
													<span>{typeof item === 'string' ? item : item.content}</span>
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
													<span>{typeof item === 'string' ? item : item.content}</span>
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
													<span>{typeof item === 'string' ? item : item.content}</span>
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
};
