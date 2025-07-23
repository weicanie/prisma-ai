import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { PersistentTaskVo, StartCrawlDto } from '@prisma-ai/shared';
import { ExternalLink } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getTaskResult, startCrawl, startSyncJobsToVectorDB } from '../../../services/hjm';
import { PageHeader } from '../components/PageHeader';

// Define a specific type for the task data
type PolledTask = PersistentTaskVo;

export const browserlessUrl = 'http://localhost:3123';

// Custom hook to poll task status
function useTaskPolling(taskId: string | null) {
	const [taskData, setTaskData] = useState<PolledTask | null>(null);

	useEffect(() => {
		if (!taskId) return;

		const interval = setInterval(async () => {
			try {
				const response = await getTaskResult(taskId);
				if (response.code === '0') {
					const task = response.data.task;
					setTaskData(task);
					if (task.status === 'completed' || task.status === 'failed') {
						clearInterval(interval);
						toast.success(`Task ${task.status}: ${task.error || 'Completed'}`);
						setIsCrawlRunning(false);
					}
				} else {
					clearInterval(interval);
					toast.error(`Polling Error: ${response.message}`);
				}
			} catch (error) {
				clearInterval(interval);
				toast.error(`Polling Exception: ${(error as Error).message}`);
			}
		}, 3000);

		return () => clearInterval(interval);
	}, [taskId]);

	return taskData;
}
/**
 * 持久化爬虫状态
 * @param isCrawlRunning
 */
function setIsCrawlRunning(isCrawlRunning: boolean) {
	localStorage.setItem('isJobCrawlRunning', isCrawlRunning.toString());
}
function getIsCrawlRunning() {
	return localStorage.getItem('isJobCrawlRunning') === 'true';
}

export function DataCrawl() {
	const [crawlInputs, setCrawlInputs] = useState<StartCrawlDto>({
		totalCount: 10,
		city: 'c101020100',
		query: '前端'
	});
	const [crawlTaskId, setCrawlTaskId] = useState<string | null>(null);
	const [syncTaskId, setSyncTaskId] = useState<string | null>(null);

	const crawlTaskData = useTaskPolling(crawlTaskId);
	const syncTaskData = useTaskPolling(syncTaskId);

	const getProgress = (task: PolledTask | null) => {
		if (!task) return 0;
		if (task.status === 'completed') return 100;
		if (task.progress && task.progress.totalCount > 0) {
			return (task.progress.completedCount / task.progress.totalCount) * 100;
		}
		return 0;
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setCrawlInputs(prev => ({
			...prev,
			[name]: name === 'totalCount' ? parseInt(value, 10) : value
		}));
	};

	// Handler to start crawling
	const handleStartCrawl = async () => {
		if (getIsCrawlRunning()) {
			toast.warning('爬取任务正在运行，请稍后再试');
			return;
		}
		setIsCrawlRunning(true);
		try {
			const response = await startCrawl(crawlInputs);
			if (response.code === '0') {
				setCrawlTaskId(response.data.id);
				toast.success(`Crawl task started with ID: ${response.data.id}`);
			} else {
				toast.error(`Failed to start: ${response.message}`);
			}
		} catch (error) {
			toast.error(`Request Exception: ${(error as Error).message}`);
		}
	};

	// Handler to start sync
	const handleStartSync = async () => {
		try {
			const response = await startSyncJobsToVectorDB();
			if (response.code === '0') {
				setSyncTaskId(response.data.id);
				toast.success(`Vectorization task started with ID: ${response.data.id}`);
			} else {
				toast.error(`Failed to start: ${response.message}`);
			}
		} catch (error) {
			toast.error(`Request Exception: ${(error as Error).message}`);
		}
	};

	return (
		<>
			<PageHeader
				title={'获取并处理岗位数据'}
				description={'从外部招聘网站抓取最新的岗位数据，并进行处理和向量化，作为后续匹配的基础。'}
			></PageHeader>
			<div className="space-y-6 p-4">
				<Card className="bg-background/50">
					<CardHeader>
						<CardTitle>1. 岗位数据获取</CardTitle>
						<CardDescription>设置爬取目标，包括关键词、城市和数量。</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid w-full max-w-sm items-center gap-1.5">
							<Label htmlFor="query">关键词</Label>
							<Input
								id="query"
								name="query"
								value={crawlInputs.query as string}
								onChange={handleInputChange}
								placeholder="例如: 前端工程师"
							/>
						</div>
						<div className="grid w-full max-w-sm items-center gap-1.5">
							<Label htmlFor="city">城市代号</Label>
							<Input
								id="city"
								name="city"
								value={crawlInputs.city}
								onChange={handleInputChange}
								placeholder="例如上海: c101020100"
							/>
						</div>
						<div className="grid w-full max-w-sm items-center gap-1.5">
							<Label htmlFor="totalCount">爬取数量</Label>
							<Input
								id="totalCount"
								name="totalCount"
								type="number"
								value={crawlInputs.totalCount}
								onChange={handleInputChange}
							/>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							onClick={handleStartCrawl}
							disabled={
								!!crawlTaskId &&
								crawlTaskData?.status !== 'completed' &&
								crawlTaskData?.status !== 'failed'
							}
						>
							开始爬取
						</Button>
					</CardFooter>
					{crawlTaskData && (
						<CardContent>
							<p className="text-sm font-medium">爬取任务进度</p>
							<p className="text-sm text-muted-foreground">任务ID: {crawlTaskId}</p>
							<p className="text-sm text-muted-foreground">状态: {crawlTaskData.status}</p>
							{/* Placeholder for Progress Bar */}
							<div className="w-[60%] bg-gray-200 rounded-full h-2.5 my-2">
								<div
									className="bg-blue-600 h-2.5 rounded-full"
									style={{
										width: `${getProgress(crawlTaskData)}%`
									}}
								></div>
							</div>
							{crawlTaskData.error && (
								<p className="text-sm text-destructive">错误: {crawlTaskData.error}</p>
							)}
						</CardContent>
					)}
				</Card>

				<Separator />

				{getIsCrawlRunning() && (
					<Card className="bg-background/50">
						<CardHeader>
							<CardTitle>爬虫正在运行</CardTitle>
							<CardDescription>
								爬虫任务正在后台执行。您可以点击下面的按钮在新标签页中打开监控面板，实时查看爬取过程。
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button variant="outline" onClick={() => window.open(browserlessUrl, '_blank')}>
								<ExternalLink className="mr-2 h-4 w-4" />
								打开监控面板
							</Button>
						</CardContent>
					</Card>
				)}

				<Separator />

				<Card className="bg-background/50">
					<CardHeader>
						<CardTitle>2. 岗位数据向量化</CardTitle>
						<CardDescription>进行岗位数据向量化,这可能需要一些时间,请耐心等待。</CardDescription>
					</CardHeader>
					<CardFooter>
						<Button
							onClick={handleStartSync}
							disabled={
								!!syncTaskId &&
								syncTaskData?.status !== 'completed' &&
								syncTaskData?.status !== 'failed'
							}
						>
							开始向量化
						</Button>
					</CardFooter>
					{syncTaskData && (
						<CardContent>
							<p className="text-sm font-medium">向量化任务进度</p>
							<p className="text-sm text-muted-foreground">任务ID: {syncTaskId}</p>
							<p className="text-sm text-muted-foreground">状态: {syncTaskData.status}</p>
							{/* Placeholder for Progress Bar */}
							<div className="w-[62%] bg-gray-200 rounded-full h-2.5 my-2">
								<div
									className="bg-blue-600 h-2.5 rounded-full"
									style={{ width: `${getProgress(syncTaskData)}%` }}
								></div>
							</div>
							{syncTaskData.error && (
								<p className="text-sm text-destructive">错误: {syncTaskData.error}</p>
							)}
						</CardContent>
					)}
				</Card>
			</div>
		</>
	);
}

export default DataCrawl;
