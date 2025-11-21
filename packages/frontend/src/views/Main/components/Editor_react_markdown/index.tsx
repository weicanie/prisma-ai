import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from 'antd';
import mermaid from 'mermaid';
import React, { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { MarkdownHooks } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeStarryNight from 'rehype-starry-night';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMermaidPlugin from 'remark-mermaid-plugin';
import { cn } from '../../../../lib/utils';
import { useTheme } from '../../../../utils/theme';
import { ErrorFallbackWithReset } from '../ErrorFallbackWithReset';
import './theme.css';
interface MarkdownEditorProps {
	initialValue?: string;
	isReadOnly?: boolean;
	onChange?: (value: string) => void;
	isEditFallback?: boolean; //是否是编辑时的渲染错误回退到milkdown
}

/* 
先显示100ms的骨架屏（这样也适用于没有mermaid图表的情况），然后检查mermaid图表是否渲染完成，如果渲染完成则替换掉骨架屏。

解决了初次渲染（要加载相关包）和渲染mermaid时（较慢）的用户体验问题
*/
const MarkdownWithSkeleton: React.FC<{
	markdown: string;
	isEditFallback?: boolean;
	theme: string;
}> = React.memo(({ markdown, isEditFallback = false, theme }) => {
	const [isComplete, setIsComplete] = useState(false);
	//mermaid图表容器（<code/>）
	const containerRef = useRef<HTMLDivElement>(null);
	//检查mermaid图表是否渲染完成的定时器
	const mermaidTimerRef = useRef<ReturnType<typeof setTimeout>>();

	useEffect(() => {
		setIsComplete(false);

		// 清除之前的定时器
		if (mermaidTimerRef.current) {
			clearTimeout(mermaidTimerRef.current);
		}

		// 检查 Mermaid 图表是否渲染完成
		// 通过容器中的svg元素是否存在来判断mermaid图表是否渲染完成
		const hasMermaidChart = markdown.includes('```mermaid');
		// 根本没有mermaid图表时会直接阻塞渲染，导致骨架屏一直显示
		if (!hasMermaidChart) {
			setIsComplete(true);
			return;
		}
		const checkMermaidComplete = () => {
			if (!containerRef.current) return;

			const mermaidElements = containerRef.current.querySelectorAll('code.language-mermaid');
			const hasUnrenderedMermaid = Array.from(mermaidElements).some(el => !el.querySelector('svg'));

			if (mermaidElements.length === 0 || !hasUnrenderedMermaid) {
				setIsComplete(true);
			} else {
				// 如果还有未完成的 Mermaid，继续检查
				mermaidTimerRef.current = setTimeout(checkMermaidComplete, 100);
			}
		};

		// 开始检查 Mermaid 渲染状态
		mermaidTimerRef.current = setTimeout(checkMermaidComplete, 100);

		return () => {
			if (mermaidTimerRef.current) {
				clearTimeout(mermaidTimerRef.current);
			}
		};
	}, [markdown]);

	//内容变更时，重新渲染mermaid图表
	useEffect(() => {
		try {
			// 重新初始化 mermaid
			mermaid.initialize({ startOnLoad: false, theme: theme === 'dark' ? 'dark' : 'default' });
			mermaid.run({
				nodes: containerRef.current?.querySelectorAll('.mermaid') || []
			});
		} catch (e) {
			console.error('Mermaid rendering error:', e);
		}
	}, [markdown]);

	const view = (
		<div className={cn(theme === 'dark' ? 'theme-github-dark' : 'theme-github-light')}>
			<div className="markdown-body bg-transparent">
				{!isComplete ? (
					<Skeleton active paragraph={{ rows: 4 }} />
				) : (
					<MarkdownHooks
						remarkPlugins={[
							//支持GFM
							remarkGfm,
							//支持mermaid
							[remarkMermaidPlugin as unknown as any, { theme }]
						]}
						rehypePlugins={[
							rehypeStarryNight,
							/* 
			mermaid插件需要渲染md中的html标签。
			*/
							rehypeRaw,
							rehypeStringify
						]}
						components={
							{
								// h1: props => <h1 className="text-2xl" {...props} />,
							}
						}
					>
						{markdown}
					</MarkdownHooks>
				)}
			</div>
		</div>
	);

	if (isEditFallback) {
		return (
			<ErrorBoundary FallbackComponent={ErrorFallbackWithReset}>
				<div ref={containerRef}>{view}</div>
			</ErrorBoundary>
		);
	}

	return (
		<ErrorBoundary fallback={<div>{markdown}</div>}>
			<div ref={containerRef}>{view}</div>
		</ErrorBoundary>
	);
});

const MarkdownPreview: React.FC<{ markdown: string; isEditFallback?: boolean }> = React.memo(
	({ markdown, isEditFallback = false }) => {
		const { resolvedTheme } = useTheme();

		return (
			<MarkdownWithSkeleton
				markdown={markdown}
				isEditFallback={isEditFallback}
				theme={resolvedTheme}
			/>
		);
	}
);

const MarkdownEditor: React.FC<MarkdownEditorProps> = React.memo(
	({ initialValue = '', isReadOnly = false, onChange, isEditFallback = false }) => {
		const [markdown, setMarkdown] = useState(initialValue);

		useEffect(() => {
			// When the initial value changes from upstream, update the state
			setMarkdown(initialValue);
		}, [initialValue]);

		const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const newValue = e.target.value;
			setMarkdown(newValue);
			if (onChange) {
				onChange(newValue);
			}
		};

		if (isReadOnly) {
			return <MarkdownPreview markdown={markdown} isEditFallback={isEditFallback} />;
		}

		return (
			<Tabs defaultValue="write" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="write">Write</TabsTrigger>
					<TabsTrigger value="preview">Preview</TabsTrigger>
				</TabsList>
				<TabsContent value="write" className="mt-4">
					<Textarea
						value={markdown}
						onChange={handleMarkdownChange}
						style={{ height: '100%', minHeight: '500px', resize: 'none' }}
						className="min-h-[500px]"
					/>
				</TabsContent>
				<TabsContent value="preview" className="mt-4">
					<MarkdownPreview markdown={markdown} />
				</TabsContent>
			</Tabs>
		);
	}
);

export default MarkdownEditor;
