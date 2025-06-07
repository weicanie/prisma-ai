import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import type {
	lookupResultDto,
	ProjectDto,
	projectLookupedDto,
	ProjectMinedDto,
	ProjectPolishedDto
} from '@prism-ai/shared';
import { MessageSquare, Sparkles, Target, Wand2, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { ProejctPMResultCard } from './ProejctPMResultCard';
import { ProjectAnalysisResultCard } from './ProjectAnalysisResultCard';

export interface ProjectResultProps {
	resultData: lookupResultDto | ProjectPolishedDto | ProjectMinedDto | null; //行动结果
	mergedData: projectLookupedDto | ProjectDto | null; //正式合并后的数据
	actionType: keyof typeof headerMap | null;
	availableActions: string[];
	handleLookup: () => void;
	handlePolish: () => void;
	handleMine: () => void;
	handleCollaborate: () => void;

	handleMerge?: () => void; //正式合并、完成优化

	content: string; //生成内容-流式
	reasonContent?: string; //推理内容-流式
	isReasoning?: boolean; //是否完成推理
	done?: boolean; //是否完成生成
}

export const headerMap = {
	lookup: {
		title: 'AI分析结果',
		desc: 'AI的深度分析结果'
	},
	polish: {
		title: 'AI优化结果',
		desc: '深度优化后的项目经验'
	},
	mine: {
		title: 'AI挖掘结果',
		desc: '深度挖掘的项目亮点'
	}
};

export const ProjectResult: React.FC<ProjectResultProps> = ({
	resultData,
	mergedData,
	actionType,
	availableActions,
	handleLookup,
	handlePolish,
	handleMine,
	handleCollaborate,
	handleMerge,
	content,
	reasonContent,
	isReasoning = false,
	done = false
}) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	// 创建滚动容器的引用
	const reasoningContentRef = useRef<HTMLDivElement>(null);
	const streamingContentRef = useRef<HTMLDivElement>(null);

	// 用户是否手动滚动的状态
	const [userScrolledReasoning, setUserScrolledReasoning] = useState(false);
	const [userScrolledStreaming, setUserScrolledStreaming] = useState(false);

	// 检测用户是否手动滚动了推理内容
	const handleReasoningScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const element = e.currentTarget;
		const isAtBottom =
			Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 35;
		setUserScrolledReasoning(!isAtBottom);
	};

	// 检测用户是否手动滚动了生成内容
	const handleStreamingScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const element = e.currentTarget;
		const isAtBottom =
			Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 35;
		setUserScrolledStreaming(!isAtBottom);
	};

	// 监听推理内容变化，自动滚动到底部
	useEffect(() => {
		if (isReasoning && reasonContent && reasoningContentRef.current && !userScrolledReasoning) {
			const element = reasoningContentRef.current;
			// 使用 requestAnimationFrame 确保DOM更新后再滚动
			requestAnimationFrame(() => {
				element.scrollTop = element.scrollHeight;
			});
		}
	}, [reasonContent, isReasoning, userScrolledReasoning]);

	// 监听生成内容变化，自动滚动到底部
	useEffect(() => {
		if (!done && content && streamingContentRef.current && !userScrolledStreaming) {
			const element = streamingContentRef.current;
			requestAnimationFrame(() => {
				element.scrollTop = element.scrollHeight;
			});
		}
	}, [content, done, userScrolledStreaming]);

	// 转阶段（推理->生成）、新生成时恢复自动滚动
	useEffect(() => {
		// 当开始推理时，重置推理滚动状态
		if (isReasoning) {
			setUserScrolledReasoning(false);
		}

		// 当开始生成内容时，重置生成滚动状态
		if (!done && content && !isReasoning) {
			setUserScrolledStreaming(false);
		}

		// 生成结束时回到顶部查看结果卡片
		if (done) {
			const element1 = reasoningContentRef.current;
			const element2 = streamingContentRef.current;
			requestAnimationFrame(() => {
				if (element1) {
					element1.scrollTop = 0;
				}
				if (element2) {
					element2.scrollTop = 0;
				}
			});
		}
	}, [isReasoning, done, content]);
	/* 思维链sse展示卡片 */
	const reasonContentSection = () => (
		<Card
			className={`overflow-hidden h-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
		>
			<CardHeader>
				<CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
					<div className="animate-pulse w-4 h-4 bg-blue-500 rounded-full"></div>
					{isReasoning ? `Prisma 正在分析和推理...` : `Prisma 的推理过程`}
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0 h-full">
				{/* 思维链内容展示 */}
				<div
					ref={reasoningContentRef}
					onScroll={handleReasoningScroll}
					className={`whitespace-pre-wrap font-mono text-sm p-4 pb-10 rounded-md h-full max-h-[90vh] overflow-y-auto scb-thin  ${isDark ? 'bg-gray-900 text-green-400' : 'bg-gray-50 text-gray-800'}`}
					style={{
						scrollBehavior: 'smooth'
					}}
				>
					<div>{reasonContent}</div>
					{/* 添加一个闪烁的光标效果 */}
					<span className="animate-pulse text-blue-400">▋</span>
				</div>
			</CardContent>
		</Card>
	);
	/* 生成内容sse展示卡片 */
	const streamingContentSection = () => (
		<Card
			className={`overflow-hidden h-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
		>
			<CardHeader>
				<CardTitle
					className={`flex items-center gap-2 font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}
				>
					<div className="animate-pulse w-4 h-4 bg-blue-500 rounded-full"></div>
					Prisma 正在整理结果...
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0 h-full">
				<div
					ref={streamingContentRef}
					onScroll={handleStreamingScroll}
					className={`whitespace-pre-wrap p-4 h-full max-h-[90vh] overflow-y-auto scb-thin ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
					style={{
						scrollBehavior: 'smooth'
					}}
				>
					{content}
					<span className="animate-pulse text-blue-400">▋</span>
				</div>
			</CardContent>
		</Card>
	);

	/* 行动选择卡片-只在开始出现 */
	const preflightSection = () => (
		<Card
			className={`h-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
		>
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
							className={`flex flex-col items-center justify-center text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
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
								className={`${isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
							>
								<Wand2 className="mr-2 h-5 w-5" /> 使用 Prisma 分析项目
							</Button>
						</Card>
					)}

					{availableActions.includes('polish') && (
						<Card
							className={`flex flex-col items-center justify-center text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
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
								让 Prisma 帮助您优化项目经验。
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
							className={`flex flex-col items-center justify-center text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
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
								className={`w-full ${isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-purple-700 hover:bg-gray-50'}`}
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
		</Card>
	);
	/* 结果卡片-根据行动类型渲染不同格式的结果 */
	const resultCardProps = {
		actionType,
		resultData,
		mergedData,
		handleMerge
	};
	const proejctResultCard = <ProejctPMResultCard {...resultCardProps} />;
	const contentMap = {
		lookup: <ProjectAnalysisResultCard {...resultCardProps} isDark={isDark} />,
		polish: proejctResultCard,
		mine: proejctResultCard
	};
	const resultCardSection = () => {
		if (!resultData || !actionType) return null;
		return contentMap[actionType];
	};

	return (
		<>
			{/* 优化选择卡片-只在开始出现 */}
			{resultData === null && !reasonContent && !content && preflightSection()}
			{/* 结果卡片-根据优化类型渲染不同格式的结果 */}
			{resultData && resultCardSection()}
			{/* 推理内容生成 */}
			{reasonContent && reasonContentSection()}
			{/* 内容生成-最后消失 */}
			{content && !done && streamingContentSection()}
		</>
	);
};
