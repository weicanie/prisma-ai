import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import { Briefcase, FileText, MessageSquare, Sparkles, Target, Wand2, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { FreeSession } from '../../../components/FlushSession';
import type { PreflightBtnsProps } from '../type';
import { ChangeLLM } from './ChangeLLM';
import ImplementRequest from './ImplementRequest';

const PreflightBtns: React.FC<PreflightBtnsProps> = ({ availableActions, actionHandlers }) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	const [isImplementRequestOpen, setIsImplementRequestOpen] = useState(false);

	return (
		<>
			<CardHeader>
				<CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
					<Zap className="w-5 h-5" />
					Prisma 简历优化
					<ChangeLLM />
					<FreeSession></FreeSession>
				</CardTitle>
				<CardDescription className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
					Prisma 将逐步深度优化你的项目经验
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-7">
					{availableActions.includes('lookup') && (
						<Card
							className={`group text-center p-11 transition-all duration-300 ease-in-out h-32 hover:h-80 ${
								isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
							}`}
						>
							<div className="flex flex-col items-center justify-center text-center">
								<Button
									onClick={actionHandlers['lookup']}
									size="lg"
									variant="outline"
									className={`w-1/2 rounded-full ${
										isDark
											? 'border-gray-600 text-gray-200 hover:bg-gray-700'
											: 'border-gray-300 hover:bg-gray-50'
									}`}
								>
									<Wand2 className="mr-2 h-5 w-5" /> 使用 Prisma 分析项目
								</Button>
							</div>
							<div className="text-center opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-96 overflow-hidden transition-all duration-500 ease-in-out">
								<Wand2
									className={`w-12 h-12 mb-4 mx-auto ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
								/>
								<h3
									className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
								>
									项目深度分析
								</h3>
								<p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									让 Prisma 帮助您分析项目的潜在问题和改进方向。
								</p>
							</div>
						</Card>
					)}

					{availableActions.includes('polish') && (
						<Card
							className={`group text-center p-11 transition-all duration-300 ease-in-out h-32 hover:h-80 ${
								isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
							}`}
						>
							<div className="flex flex-col items-center justify-center text-center">
								<Button
									onClick={actionHandlers['polish']}
									variant="outline"
									className={`w-1/2 rounded-full ${
										isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'
									} text-white `}
									size="lg"
								>
									<Sparkles className="w-4 h-4 mr-2" />
									深度优化项目经验
								</Button>
							</div>
							<div className="text-center opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-96 overflow-hidden transition-all duration-500 ease-in-out">
								<Sparkles
									className={`w-12 h-12 mb-4 mx-auto ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
								/>
								<h3
									className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
								>
									项目深度优化
								</h3>
								<p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									让 Prisma 根据分析结果帮助您优化项目经验。
								</p>
							</div>
						</Card>
					)}

					{availableActions.includes('mine') && (
						<Card
							className={`group text-center p-11 transition-all duration-300 ease-in-out h-32 hover:h-80 ${
								isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
							}`}
						>
							<div className="flex flex-col items-center justify-center text-center">
								<Button
									onClick={actionHandlers['mine']}
									variant="outline"
									className={`w-1/2 rounded-full ${
										isDark
											? 'border-gray-600 text-gray-200 hover:bg-gray-700'
											: 'border-gray-300 hover:bg-gray-50'
									}`}
									size="lg"
								>
									<Target className="w-4 h-4 mr-2" />
									深度挖掘项目亮点
								</Button>
							</div>
							<div className="text-center opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-96 overflow-hidden transition-all duration-500 ease-in-out">
								<Target
									className={`w-12 h-12 mb-4 mx-auto ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
								/>
								<h3
									className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
								>
									亮点深度挖掘
								</h3>
								<p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									让 Prisma 帮助您挖掘项目亮点。
								</p>
							</div>
						</Card>
					)}

					{availableActions.includes('collaborate') && (
						<Card
							className={`group text-center p-11 transition-all duration-300 ease-in-out h-32 hover:h-80 ${
								isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
							}`}
						>
							<div className="flex flex-col items-center justify-center text-center">
								<Button
									onClick={() => setIsImplementRequestOpen(true)}
									variant="outline"
									className={`w-1/2 rounded-full ${
										isDark
											? 'border-gray-600 text-gray-200 hover:bg-gray-700'
											: 'border-gray-300 hover:bg-gray-50'
									}`}
									size="lg"
								>
									<MessageSquare className="w-4 h-4 mr-2" />
									与AI Agent协作
								</Button>
							</div>
							<div className="flex flex-col items-center justify-center text-center opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-96 overflow-hidden transition-all duration-500 ease-in-out">
								<MessageSquare
									className={`w-12 h-12 mb-4 mx-auto ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
								/>
								<h3
									className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
								>
									亮点协同实现
								</h3>
								<p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									让 Prisma 协助您实现项目亮点。
								</p>
							</div>
						</Card>
					)}

					{availableActions.includes('businessLookup') && (
						<Card
							className={`group text-center p-11 transition-all duration-300 ease-in-out h-32 hover:h-80 ${
								isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
							}`}
						>
							<div className="flex flex-col items-center justify-center text-center">
								<Button
									onClick={actionHandlers['businessLookup']}
									variant="outline"
									className={`w-1/2 rounded-full ${
										isDark
											? 'border-gray-600 text-gray-200 hover:bg-gray-700'
											: 'border-gray-300 hover:bg-gray-50'
									}`}
									size="lg"
								>
									<Briefcase className="w-4 h-4 mr-2" />
									深挖项目业务
								</Button>
							</div>
							<div className="text-center opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-96 overflow-hidden transition-all duration-500 ease-in-out">
								<Briefcase
									className={`w-12 h-12 mb-4 mx-auto ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
								/>
								<h3
									className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
								>
									业务深度挖掘
								</h3>
								<p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									让 Prisma 帮助您深挖项目业务。
								</p>
							</div>
						</Card>
					)}

					{availableActions.includes('businessPaper') && (
						<Card
							className={`group text-center p-11 transition-all duration-300 ease-in-out h-32 hover:h-80 ${
								isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
							}`}
						>
							<div className="flex flex-col items-center justify-center text-center">
								<Button
									onClick={actionHandlers['businessPaper']}
									className={`w-1/2 rounded-full ${
										isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'
									} text-white `}
									size="lg"
								>
									<FileText className="w-4 h-4 mr-2" />
									生成项目业务文档
								</Button>
							</div>
							<div className="text-center opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-96 overflow-hidden transition-all duration-500 ease-in-out">
								<FileText
									className={`w-12 h-12 mb-4 mx-auto ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
								/>
								<h3
									className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
								>
									业务文档深度生成
								</h3>
								<p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									让 Prisma 帮助您生成项目业务文档。
								</p>
							</div>
						</Card>
					)}
				</div>
			</CardContent>
			<ImplementRequest
				open={isImplementRequestOpen}
				onOpenChange={setIsImplementRequestOpen}
				onSubmit={actionHandlers['collaborate']}
			/>
		</>
	);
};

export default PreflightBtns;
