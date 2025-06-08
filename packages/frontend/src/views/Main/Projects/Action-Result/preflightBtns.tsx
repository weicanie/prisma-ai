import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import { MessageSquare, Sparkles, Target, Wand2, Zap } from 'lucide-react';
import React from 'react';

interface PreflightBtnsProps {
	availableActions: string[];
	handleLookup: () => void;
	handlePolish: () => void;
	handleMine: () => void;
	handleCollaborate: () => void;
}

const PreflightBtns: React.FC<PreflightBtnsProps> = ({
	availableActions,
	handleLookup,
	handlePolish,
	handleMine,
	handleCollaborate
}) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	return (
		<>
			<CardHeader>
				<CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
					<Zap className="w-5 h-5" />
					Prisma 简历优化
				</CardTitle>
				<CardDescription className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
					Prisma 将逐步深度优化你的项目经验
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{availableActions.includes('lookup') && (
						<Card
							className={`flex flex-col items-center justify-center text-center ${
								isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
							}`}
						>
							<Wand2 className={`w-12 h-12 mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
							<h3
								className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								项目深度分析
							</h3>
							<p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
								让 Prisma 帮助您分析项目的潜在问题和改进方向。
							</p>
							<Button
								onClick={handleLookup}
								size="lg"
								className={`${
									isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'
								} text-white`}
							>
								<Wand2 className="mr-2 h-5 w-5" /> 使用 Prisma 分析项目
							</Button>
						</Card>
					)}

					{availableActions.includes('polish') && (
						<Card
							className={`flex flex-col items-center justify-center text-center ${
								isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
							}`}
						>
							<Sparkles
								className={`w-12 h-12 mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
							/>
							<h3
								className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								项目深度优化
							</h3>
							<p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
								让 Prisma 根据分析结果帮助您优化项目经验。
							</p>
							<Button
								onClick={handlePolish}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white"
								size="lg"
							>
								<Sparkles className="w-4 h-4 mr-2" />
								深度优化项目经验
							</Button>
						</Card>
					)}

					{availableActions.includes('mine') && (
						<Card
							className={`flex flex-col items-center justify-center text-center ${
								isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
							}`}
						>
							<Sparkles
								className={`w-12 h-12 mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
							/>
							<h3
								className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								亮点深度挖掘
							</h3>
							<p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
								让 Prisma 帮助您挖掘项目亮点。
							</p>
							<Button
								onClick={handleMine}
								variant="outline"
								className={`w-full ${
									isDark
										? 'border-gray-600 text-gray-200 hover:bg-gray-700'
										: 'border-gray-300 text-purple-700 hover:bg-gray-50'
								}`}
								size="lg"
							>
								<Target className="w-4 h-4 mr-2" />
								深度挖掘项目亮点
							</Button>
						</Card>
					)}

					{availableActions.includes('collaborate') && (
						<Button
							onClick={handleCollaborate}
							variant="default"
							className="w-full bg-purple-600 hover:bg-purple-700 text-white"
							size="lg"
						>
							<MessageSquare className="w-4 h-4 mr-2" />
							与AI Agent协作
						</Button>
					)}
				</div>
			</CardContent>
		</>
	);
};

export default PreflightBtns;
