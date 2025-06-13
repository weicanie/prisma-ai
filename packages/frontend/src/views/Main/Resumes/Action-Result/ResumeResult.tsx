import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';

import type { ResumeMatchedDto, ResumeVo } from '@prism-ai/shared';
import { Brain, Pyramid, Rocket, Sparkles } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Tabs from '../../components/Tabs';
import PreflightBtns from './preflightBtns';
import { ResumeMatchResultCard } from './ResumeMatchResultCard';

export interface ResumeResultProps {
	resultData: ResumeMatchedDto | null;
	mergedData: null;
	resumeData: ResumeVo; //原简历数据,用于展示结果时填充一些其它数据
	actionType: keyof typeof headerMap | null;
	availableActions: readonly string[];
	handleMatch: () => void;
	handleMerge?: () => void;

	content: string;
	reasonContent?: string;
	isReasoning?: boolean;
	done?: boolean;
}

export const headerMap = {
	match: {
		title: 'AI 智能匹配结果',
		desc: 'AI 正在分析您的简历并匹配合适的岗位'
	},
	collaborate: {
		title: 'AI协作结果',
		desc: '与AI Agent协作的结果'
	}
};

/**
 * 简历操作结果组件
 * @description 右侧的Tab组件，用于展示操作按钮、思考过程、生成内容和最终结果
 */
export const ResumeResult: React.FC<ResumeResultProps> = ({
	resultData,
	resumeData,
	actionType,
	availableActions,
	handleMatch,
	content,
	reasonContent,
	isReasoning = false,
	done = false
}) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	const reasoningContentRef = useRef<HTMLDivElement>(null);
	const streamingContentRef = useRef<HTMLDivElement>(null);

	const [userScrolledReasoning, setUserScrolledReasoning] = useState(false);
	const [userScrolledStreaming, setUserScrolledStreaming] = useState(false);

	const handleReasoningScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const element = e.currentTarget;
		const isAtBottom =
			Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 35;
		setUserScrolledReasoning(!isAtBottom);
	};

	const handleStreamingScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const element = e.currentTarget;
		const isAtBottom =
			Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 35;
		setUserScrolledStreaming(!isAtBottom);
	};

	useEffect(() => {
		if (isReasoning && reasonContent && reasoningContentRef.current && !userScrolledReasoning) {
			const element = reasoningContentRef.current;
			requestAnimationFrame(() => {
				element.scrollTop = element.scrollHeight;
			});
		}
	}, [reasonContent, isReasoning, userScrolledReasoning]);

	useEffect(() => {
		if (!done && content && streamingContentRef.current && !userScrolledStreaming) {
			const element = streamingContentRef.current;
			requestAnimationFrame(() => {
				element.scrollTop = element.scrollHeight;
			});
		}
	}, [content, done, userScrolledStreaming]);

	useEffect(() => {
		if (isReasoning) setUserScrolledReasoning(false);
		if (!done && content && !isReasoning) setUserScrolledStreaming(false);
		if (done) {
			const element1 = reasoningContentRef.current;
			const element2 = streamingContentRef.current;
			requestAnimationFrame(() => {
				if (element1) element1.scrollTop = 0;
				if (element2) element2.scrollTop = 0;
			});
		}
	}, [isReasoning, done, content]);

	/* 思维链sse展示卡片 */
	const reasonContentSection = () => (
		<>
			<CardHeader>
				<CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
					<div className="animate-pulse w-4 h-4 bg-blue-500 rounded-full"></div>
					{isReasoning ? `Prisma 正在分析和推理...` : `Prisma 的推理过程`}
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0 h-full">
				<div
					ref={reasoningContentRef}
					onScroll={handleReasoningScroll}
					className={`whitespace-pre-wrap font-mono text-sm p-4 pb-20 rounded-md  max-h-[calc(100vh-200px)] overflow-y-auto scb-thin  ${
						isDark ? 'bg-gray-900 text-green-400' : 'bg-gray-50 text-gray-800'
					}`}
					style={{ scrollBehavior: 'smooth' }}
				>
					{reasonContent || 'Prisma 在等待你的指示送达...'}
					<span className="animate-pulse text-blue-400">▋</span>
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
					className={`whitespace-pre-wrap font-mono text-sm p-4 pb-20 rounded-md  max-h-[calc(100vh-200px)] overflow-y-auto scb-thin  ${
						isDark ? 'bg-gray-900 text-green-400' : 'bg-gray-50 text-gray-800'
					}`}
					style={{ scrollBehavior: 'smooth' }}
				>
					{content || 'Prisma 在等待你的指示送达...'}
					<span className="animate-pulse text-blue-400">▋</span>
				</div>
			</CardContent>
		</>
	);
	console.log('🚀 ~ resultCardSection ~ actionType:', actionType);

	const resultCardSection = () => {
		if (!resultData || !actionType)
			return <div className="text-center text-gray-500">暂无结果</div>;
		if (actionType === 'match') {
			return <ResumeMatchResultCard resultData={resultData} resumeData={resumeData} />;
		}
		return null;
	};

	const tabs = [
		{ name: '行动', href: '#next-action', icon: Pyramid, current: true },
		{ name: '思考', href: '#reasoning', icon: Brain, current: false },
		{ name: '生成', href: '#content', icon: Sparkles, current: false },
		{ name: '结果', href: '#result', icon: Rocket, current: false }
	];

	const hash = window.location.hash;

	const renderComponent = () => {
		switch (hash) {
			case '#next-action':
				return <PreflightBtns availableActions={availableActions} handleMatch={handleMatch} />;
			case '#reasoning':
				return reasonContentSection();
			case '#content':
				return streamingContentSection();
			case '#result':
				return resultCardSection();
			default:
				return <PreflightBtns availableActions={availableActions} handleMatch={handleMatch} />;
		}
	};

	return (
		<Card
			className={`overflow-auto scb-thin ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
		>
			<Tabs tabs={tabs} />
			{renderComponent()}
		</Card>
	);
};
