import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/utils/theme';
import type { ProjectMinedDto, ProjectPolishedDto } from '@prism-ai/shared';
import { Code, Lightbulb, MessageSquare, Pyramid, Sparkles, Target, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { MinedPolishedLightspotSection } from './MinedLightspotSection';
import { PolishedLightspotSection } from './PolishedLightspotSection';

interface ProjectResultProps {
	optimizedData: ProjectPolishedDto | ProjectMinedDto | null; //优化后的数据
	mergedData: ProjectPolishedDto | ProjectMinedDto | null; //正式合并后的数据
	optimizationType: 'polish' | 'mine' | null;
	availableActions: string[];
	handlePolish: () => void;
	handleMine: () => void;
	handleCollaborate: () => void;

	handleMerge?: () => void; //正式合并、完成优化

	content: string; //生成内容-流式
	reasonContent?: string; //推理内容-流式
	isReasoning?: boolean; //是否完成推理
	done?: boolean; //是否完成生成
}

export const ProjectResult: React.FC<ProjectResultProps> = ({
	optimizedData,
	mergedData,
	optimizationType,
	availableActions,
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
				element1 && (element1.scrollTop = 0);
				element2 && (element2.scrollTop = 0);
			});
		}
	}, [isReasoning, done, content]);

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
	/* 优化选择卡片-只在开始出现 */
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
					{availableActions.includes('polish') && (
						<Button
							onClick={handlePolish}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white"
							size="lg"
						>
							<Sparkles className="w-4 h-4 mr-2" />
							打磨优化项目经验
						</Button>
					)}

					{availableActions.includes('mine') && (
						<Button
							onClick={handleMine}
							variant="outline"
							className={`w-full ${isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-purple-700 hover:bg-gray-50'}`}
							size="lg"
						>
							<Target className="w-4 h-4 mr-2" />
							深度挖掘项目亮点
						</Button>
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
	/* 结果卡片-根据优化类型渲染不同格式的结果 */
	const resultCardSection = () => {
		if (!optimizedData) return null;
		return (
			<Card
				className={`h-full mb-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
			>
				<CardHeader>
					<CardTitle
						className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
					>
						<Zap className="w-5 h-5" />
						{optimizationType === 'polish' ? 'AI打磨结果' : 'AI挖掘结果'}
					</CardTitle>
					<CardDescription className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
						{optimizationType === 'polish' ? '优化后的项目描述' : '深度挖掘的项目亮点'}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* 基本信息 */}
					<div className="space-y-4">
						{optimizedData.info.desc.role && (
							<div>
								<h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
									角色职责
								</h4>
								<p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									{optimizedData.info.desc.role}
								</p>
							</div>
						)}

						{optimizedData.info.desc.contribute && (
							<div>
								<h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
									核心贡献
								</h4>
								<p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									{optimizedData.info.desc.contribute}
								</p>
							</div>
						)}

						{optimizedData.info.desc.bgAndTarget && (
							<div>
								<h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
									项目背景
								</h4>
								<p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									{optimizedData.info.desc.bgAndTarget}
								</p>
							</div>
						)}
					</div>
					<Separator />
					{/* 技术栈 */}
					{optimizedData.info.techStack?.length > 0 && (
						<div>
							<h4
								className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
							>
								<Code className="w-4 h-4" />
								技术栈
							</h4>
							<div className="flex flex-wrap gap-2">
								{optimizedData.info.techStack.map((tech, index) => (
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

					{/* 优化后的亮点 */}
					{optimizedData.lightspot && (
						<div>
							<h4
								className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								<Sparkles className="w-5 h-5" />
								{optimizationType === 'polish' ? '优化后亮点' : '原始亮点'}
							</h4>
							<PolishedLightspotSection
								lightspot={optimizedData.lightspot}
								isPolished={optimizationType === 'polish'}
							/>
						</div>
					)}

					{/* 如果是挖掘结果，显示新增亮点 */}
					{optimizationType === 'mine' &&
						'lightspotAdded' in optimizedData &&
						optimizedData.lightspotAdded && (
							<>
								<Separator />
								<div>
									<h4
										className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
									>
										<Lightbulb className="w-5 h-5" />
										新增亮点
									</h4>
									<MinedPolishedLightspotSection lightspotAdded={optimizedData.lightspotAdded} />
								</div>
							</>
						)}
				</CardContent>
				{mergedData && (
					<Button
						onClick={handleMerge}
						variant="outline"
						className="fixed bottom-5 rounded-md right-5 w-full hover:bg-purple-700 text-white"
						size="lg"
					>
						<Pyramid className="w-4 h-4 mr-2" />
						完成优化
					</Button>
				)}
			</Card>
		);
	};
	return (
		<>
			{/* 优化选择卡片-只在开始出现 */}
			{optimizedData === null && !reasonContent && !content && preflightSection()}
			{/* 结果卡片-根据优化类型渲染不同格式的结果 */}
			{optimizedData && resultCardSection()}
			{/* 推理内容生成 */}
			{reasonContent && reasonContentSection()}
			{/* 内容生成-最后消失 */}
			{content && !done && streamingContentSection()}
		</>
	);
};
