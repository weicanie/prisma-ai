import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import { SelectedLLM } from '@prisma-ai/shared';
import { Brain, Pyramid, Rocket, Sparkles } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectProjectLLM } from '../../../../../../store/projects';
import Tabs from '../../../../components/Tabs';
import type { ProjectResultProps } from '../../type';
import PreflightBtns from '../preflightBtns';
import { ProejctPMResultCard } from './ProejctPMResultCard';
import { ProjectBusinessResultCard } from './ProjectBNesultCard.';
import { ProjectAnalysisResultCard } from './ProjectLResultCard';
export const ProjectResult: React.FC<ProjectResultProps> = ({
	resultData,
	mergedData,
	actionType,
	availableActions,
	actionHandlers,
	handleMerge,
	handleFeedback,
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
	const selectedllm = useSelector(selectProjectLLM);
	/* 思维链sse展示卡片 */
	const reasonContentSection = () => (
		<>
			<CardHeader>
				<CardTitle
					className={`flex items-center gap-2 font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}
				>
					<div className="animate-pulse w-4 h-4 bg-blue-500 rounded-full"></div>
					Prisma 的推理过程
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0 h-full">
				{/* 思维链内容展示 */}
				<div
					ref={reasoningContentRef}
					onScroll={handleReasoningScroll}
					className={`whitespace-pre-wrap font-mono text-sm dark:text-zinc-200 p-4 pb-20 rounded-md  max-h-[calc(100vh-400px)] overflow-y-auto scb-thin`}
					style={{
						scrollBehavior: 'smooth'
					}}
				>
					{reasonContent ||
						(selectedllm === SelectedLLM.deepseek_reasoner
							? 'Prisma 在等待你的指示送达...'
							: 'Prisma 正在后台动态思考...')}
					{/* 添加一个闪烁的光标效果 */}
					{/* <span className="animate-pulse text-blue-400">▋</span> */}
				</div>
			</CardContent>
		</>
	);
	/* 生成内容sse展示卡片 */
	const streamingContentSection = () => (
		<>
			<CardHeader>
				<CardTitle
					className={`flex items-center gap-2 font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}
				>
					<div className="animate-pulse w-4 h-4 bg-blue-500 rounded-full"></div>
					Prisma 的生成结果
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0 h-full">
				<div
					ref={streamingContentRef}
					onScroll={handleStreamingScroll}
					className={`whitespace-pre-wrap font-mono text-sm dark:text-zinc-200 p-4 pb-20 rounded-md  max-h-[calc(100vh-400px)] overflow-y-auto scb-thin`}
					style={{
						scrollBehavior: 'smooth'
					}}
				>
					{content || 'Prisma 在等待你的指示送达...'}
					{/* <span className="animate-pulse text-blue-400">▋</span> */}
				</div>
			</CardContent>
		</>
	);

	/* 结果卡片-根据行动类型渲染不同格式的结果 */
	const resultCardProps = {
		actionType,
		resultData,
		mergedData,
		handleMerge,
		handleFeedback,
		done
	};
	const proejctResultCard = <ProejctPMResultCard {...resultCardProps} />;
	const contentMap = {
		lookup: <ProjectAnalysisResultCard {...resultCardProps} isDark={isDark} />,
		polish: proejctResultCard,
		mine: proejctResultCard,
		collaborate: <div>AI Agent 协作中...</div>,
		businessLookup: <ProjectBusinessResultCard {...resultCardProps} isDark={isDark} />,
		businessPaper: <ProjectBusinessResultCard {...resultCardProps} isDark={isDark} />
	};
	const resultCardSection = () => {
		if (!resultData || !actionType)
			return <div className="text-center text-gray-500">暂无结果</div>;
		return contentMap[actionType as keyof typeof contentMap];
	};
	const tabs = [
		{ name: '行动', href: '#next-action', icon: Pyramid, current: true },
		{ name: '思考', href: '#reasoning', icon: Brain, current: false },
		{ name: '生成', href: '#content', icon: Sparkles, current: false },
		{ name: '结果', href: '#result', icon: Rocket, current: false }
	];
	//根据当前hash值决定渲染的组件
	const hash = window.location.hash;

	const renderComponent = () => {
		if (hash === '#next-action') {
			return <PreflightBtns availableActions={availableActions} actionHandlers={actionHandlers} />;
		}

		if (hash === '#reasoning') {
			return reasonContentSection();
		}
		if (hash === '#content') {
			return streamingContentSection();
		}
		if (hash === '#result') {
			return resultCardSection();
		}
		return <PreflightBtns availableActions={availableActions} actionHandlers={actionHandlers} />;
	};
	return (
		<>
			<Card
				className={`h-full max-h-[calc(100vh-150px)] overflow-auto scb-thin ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
			>
				<Tabs tabs={tabs} />
				{renderComponent()}
			</Card>
		</>
	);
};
