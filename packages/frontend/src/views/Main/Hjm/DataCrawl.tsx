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
import type { PersistentTaskVo, StartCrawlDto } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Play, Square } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/badge';
import { useCustomQuery } from '../../../query/config';
import { JobQueryKey } from '../../../query/keys';
import {
	getJobCount,
	getTaskResult,
	startCrawl,
	startSyncJobsToVectorDB
} from '../../../services/hjm';
import { PageHeader } from '../components/PageHeader';

// Define a specific type for the task data
type PolledTask = PersistentTaskVo;

export const browserlessUrl = 'http://localhost:3123';

// Custom hook to poll task status
function useTaskPolling(taskId: string | null, onTaskComplete?: () => void) {
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
						// 任务完成后调用回调函数
						onTaskComplete?.();
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
	}, [taskId, onTaskComplete]);

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

	const queryClient = useQueryClient();
	const crawlTaskData = useTaskPolling(crawlTaskId, () => {
		setIsCrawlRunning(false);
		setCrawlTaskId(null);
		queryClient.invalidateQueries({ queryKey: [JobQueryKey.JobCount] });
	});
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
				setIsCrawlRunning(false);
			}
		} catch (error) {
			toast.error(`Request Exception: ${(error as Error).message}`);
			setIsCrawlRunning(false);
		}
	};

	// Handler to cancel crawling
	const handleCancelCrawl = async () => {
		// 后端暂未实现任务取消机制
		setIsCrawlRunning(false);
		setCrawlTaskId(null);
		toast.success('爬取任务已取消');
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

	// 检查是否有正在运行的任务
	const isTaskRunning =
		(crawlTaskId && crawlTaskData && !['completed', 'failed'].includes(crawlTaskData.status)) ||
		getIsCrawlRunning();

	//获取数据库中的岗位数量
	const { data: jobCountData, status: jobCountStatus } = useCustomQuery(
		[JobQueryKey.JobCount],
		() => getJobCount()
	);
	if (jobCountStatus === 'pending') {
		return <div>Loading...</div>;
	}
	if (jobCountStatus === 'error') {
		return <div>Error: {jobCountData?.message}</div>;
	}

	const jobCount = jobCountData?.data;

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
						{!isTaskRunning ? (
							<Button onClick={handleStartCrawl} disabled={!crawlInputs.query || !crawlInputs.city}>
								<Play className="mr-2 h-4 w-4" />
								开始爬取
							</Button>
						) : (
							<Button onClick={handleCancelCrawl} variant="destructive">
								<Square className="mr-2 h-4 w-4" />
								取消爬取
							</Button>
						)}
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

				<Card className="bg-background/50">
					<CardHeader>
						<CardTitle>
							数据库中的岗位数量 = <Badge variant={'outline'}>{jobCount}</Badge>
						</CardTitle>
					</CardHeader>
				</Card>
			</div>
		</>
	);
}

export default DataCrawl;
