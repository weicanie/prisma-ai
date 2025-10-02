import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import { Brain, MessageSquare, Sparkles, User } from 'lucide-react';
import React from 'react';

interface TipsCardProps {
	className?: string;
}

/**
 * AI聊天提示卡片组件
 * @description 在用户未输入内容时展示AI模块的特性和用法说明
 */
const TipsCard: React.FC<TipsCardProps> = ({ className }) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	return (
		<div className={`flex flex-col items-center justify-center gap-6 py-8 ${className}`}>
			{/* 主标题区域 */}
			<div className="text-center space-y-3">
				<div className="flex items-center justify-center gap-2 mb-4">
					<Brain className="w-8 h-8 text-blue-500" />
					<h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
						Prisma
					</h2>
				</div>
				<p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl`}>
					懂你和你的项目
				</p>
			</div>

			{/* 功能特性卡片 */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
				{/* 智能问答 */}
				<Card
					className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-200 hover:shadow-lg`}
				>
					<CardHeader>
						<CardTitle
							className={`flex items-center gap-2 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}
						>
							<MessageSquare className="w-5 h-5 text-green-500" />
							知识库
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
							Prisma 已通过项目知识库理解你的项目
						</p>
					</CardContent>
				</Card>

				{/* 个性化建议 */}
				<Card
					className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-200 hover:shadow-lg`}
				>
					<CardHeader>
						<CardTitle
							className={`flex items-center gap-2 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}
						>
							<User className="w-5 h-5 text-purple-500" />
							记忆
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
							Prisma 已通过用户记忆记住你
						</p>
					</CardContent>
				</Card>
			</div>

			{/* 使用说明 */}
			<Card
				className={`${isDark ? 'bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'} transition-colors duration-200 w-full max-w-3xl`}
			>
				<CardHeader>
					<CardTitle
						className={`flex items-center gap-2 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}
					>
						<Sparkles className="w-5 h-5 text-yellow-500" />
						开始使用
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-start gap-3">
						<div
							className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}
						>
							1
						</div>
						<p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-sm`}>
							<strong>选择项目经验作为对话背景：</strong>在下方下拉框中选择
						</p>
					</div>
					<div className="flex items-start gap-3">
						<div
							className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}
						>
							2
						</div>
						<p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-sm`}>
							<strong>开始对话：</strong>在下方输入框中输入
						</p>
					</div>
				</CardContent>
			</Card>

			{/* 示例问题 */}
			{/* <div className="text-center">
				<p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
					您可以尝试这些问题：
				</p>
				<div className="flex flex-wrap justify-center gap-2 text-xs">
					<span
						className={`px-3 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
					>
						"帮我分析这个项目的技术亮点"
					</span>
					<span
						className={`px-3 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
					>
						"如何用分层回答法介绍这个项目？"
					</span>
					<span
						className={`px-3 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
					>
						"这个项目中可能被问到的面试题"
					</span>
				</div>
			</div> */}
		</div>
	);
};

export default TipsCard;
