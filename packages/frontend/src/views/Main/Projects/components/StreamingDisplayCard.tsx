import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useEffect, useRef, useState } from 'react';

interface StreamingDisplayCardProps {
	title: string;
	currentContent: string | null | undefined;
	isDark: boolean;
	isStreamingDone: boolean; // 控制光标闪烁和其他“正在进行”的UI
	scrollContainerMaxHeight?: string; // 可选的可滚动区域的最大高度
}

/**
 * 可流式展示内容的卡片组件
 * 用于显示AI的思维链或生成中的内容，并支持自动滚动。
 */
export const StreamingDisplayCard: React.FC<StreamingDisplayCardProps> = ({
	title,
	currentContent,
	isDark,
	isStreamingDone,
	scrollContainerMaxHeight = '90vh'
}) => {
	const contentRef = useRef<HTMLDivElement>(null);
	const [userScrolled, setUserScrolled] = useState(false);

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const element = e.currentTarget;
		//根据离底高度判断用户是否滚动
		const isAtBottom =
			Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 35;
		setUserScrolled(!isAtBottom);
	};

	// 自动滚动到底部，如果新的内容到达，且用户还没有滚动
	useEffect(() => {
		if (!isStreamingDone && currentContent && contentRef.current && !userScrolled) {
			const element = contentRef.current;
			requestAnimationFrame(() => {
				element.scrollTop = element.scrollHeight;
			});
		}
	}, [currentContent, isStreamingDone, userScrolled]);

	// 开始和结束时清除用户滚动,以在流式内容更新时自动滚动
	useEffect(() => {
		if (!isStreamingDone) {
			setUserScrolled(false);
		}
	}, [isStreamingDone]);

	return (
		<Card
			className={`overflow-hidden h-full scb-thin ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
		>
			<CardHeader>
				<CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
					{!isStreamingDone && (
						<div className="animate-pulse w-3 h-3 bg-blue-500 rounded-full"></div>
					)}
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0 h-full">
				<div
					ref={contentRef}
					onScroll={handleScroll}
					className={`whitespace-pre-wrap font-mono text-sm p-4 pb-6 rounded-b-md h-full overflow-y-auto scb-thin ${isDark ? 'bg-gray-900 text-green-400' : 'bg-gray-50 text-gray-800'}`}
					style={{
						maxHeight: scrollContainerMaxHeight,
						scrollBehavior: 'smooth'
					}}
				>
					{currentContent || (isStreamingDone ? '(无内容)' : '等待内容...')}
					{!isStreamingDone && currentContent && (
						<span className="animate-pulse text-blue-400">▋</span>
					)}
				</div>
			</CardContent>
		</Card>
	);
};
