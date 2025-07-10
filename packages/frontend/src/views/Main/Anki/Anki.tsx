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
import type { PersistentTaskVo, StartCrawlQuestionDto } from '@prism-ai/shared';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
	getTaskResult,
	startCrawlQuestions,
	startGenerateMindmap,
	startUploadToAnki
} from '../../../services/question';
import { PageHeader } from '../components/PageHeader';

// Custom hook to poll task status
function useTaskPolling(taskId: string | null) {
	const [taskData, setTaskData] = useState<PersistentTaskVo | null>(null);

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
						toast.success(`任务 ${task.status}: ${task.error || '已完成'}`);
					}
				} else {
					clearInterval(interval);
					toast.error(`轮询错误: ${response.message}`);
				}
			} catch (error) {
				clearInterval(interval);
				toast.error(`轮询异常: ${(error as Error).message}`);
			}
		}, 3000);

		return () => clearInterval(interval);
	}, [taskId]);

	return taskData;
}

export function Anki() {
	// State for crawl inputs and task ID
	const [crawlInputs, setCrawlInputs] = useState<StartCrawlQuestionDto>({
		list: '',
		domain: ''
	});
	const [crawlTaskId, setCrawlTaskId] = useState<string | null>(null);
	const [mindmapTaskId, setMindmapTaskId] = useState<string | null>(null);
	const [ankiTaskId, setAnkiTaskId] = useState<string | null>(null);

	// Polling hooks for each task
	const crawlTaskData = useTaskPolling(crawlTaskId);
	const mindmapTaskData = useTaskPolling(mindmapTaskId);
	const ankiTaskData = useTaskPolling(ankiTaskId);

	const getProgress = (task: PersistentTaskVo | null) => {
		if (!task) return 0;
		if (task.status === 'completed') return 100;
		if (task.progress && task.progress.totalCount > 0) {
			return (task.progress.completedCount / task.progress.totalCount) * 100;
		}
		return 0;
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setCrawlInputs(prev => ({ ...prev, [name]: value }));
	};

	const handleStartCrawl = async () => {
		try {
			const response = await startCrawlQuestions(crawlInputs);
			if (response.code === '0') {
				setCrawlTaskId(response.data.id);
				toast.success(`爬取任务已启动，ID: ${response.data.id}`);
			} else {
				toast.error(`启动失败: ${response.message}`);
			}
		} catch (error) {
			toast.error(`请求异常: ${(error as Error).message}`);
		}
	};

	const handleGenerateMindmap = async () => {
		try {
			const response = await startGenerateMindmap();
			if (response.code === '0') {
				setMindmapTaskId(response.data.id);
				toast.success(`思维导图生成任务已启动，ID: ${response.data.id}`);
			} else {
				toast.error(`启动失败: ${response.message}`);
			}
		} catch (error) {
			toast.error(`请求异常: ${(error as Error).message}`);
		}
	};

	const handleUploadToAnki = async () => {
		try {
			const response = await startUploadToAnki();
			if (response.code === '0') {
				setAnkiTaskId(response.data.id);
				toast.success(`Anki上传任务已启动，ID: ${response.data.id}`);
			} else {
				toast.error(`启动失败: ${response.message}`);
			}
		} catch (error) {
			toast.error(`请求异常: ${(error as Error).message}`);
		}
	};

	const TaskProgress = ({
		title,
		taskData,
		taskId
	}: {
		title: string;
		taskData: PersistentTaskVo | null;
		taskId: string | null;
	}) =>
		taskData ? (
			<CardContent>
				<p className="text-sm font-medium">{title}进度</p>
				<p className="text-sm text-muted-foreground">任务ID: {taskId}</p>
				<p className="text-sm text-muted-foreground">状态: {taskData.status}</p>
				<div className="w-[60%] bg-gray-200 rounded-full h-2.5 my-2">
					<div
						className="bg-blue-600 h-2.5 rounded-full"
						style={{ width: `${getProgress(taskData)}%` }}
					></div>
				</div>
				{taskData.error && <p className="text-sm text-destructive">错误: {taskData.error}</p>}
			</CardContent>
		) : null;

	return (
		<>
			<PageHeader
				title={'集成面试题库和 anki'}
				description={'从外部网站获取题库数据，进行处理并上传到 Anki。'}
			></PageHeader>
			<div className="space-y-6 p-4">
				<Card className="bg-background/50">
					<CardHeader>
						<CardTitle>1. 题库数据获取</CardTitle>
						<CardDescription>导入目标网站的题目数据。</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid w-full max-w-sm items-center gap-1.5">
							<Label htmlFor="domain">域名</Label>
							<Input
								id="domain"
								name="domain"
								value={crawlInputs.domain}
								onChange={handleInputChange}
								placeholder="例如: https://example.com"
							/>
						</div>
						<div className="grid w-full max-w-sm items-center gap-1.5">
							<Label htmlFor="list">数据列表页URL</Label>
							<Input
								id="list"
								name="list"
								value={crawlInputs.list}
								onChange={handleInputChange}
								placeholder="例如: https://example.com/questions"
							/>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							onClick={handleStartCrawl}
							disabled={
								!!crawlTaskId && !['completed', 'failed'].includes(crawlTaskData?.status ?? '')
							}
						>
							开始爬取
						</Button>
					</CardFooter>
					<TaskProgress title="爬取任务" taskData={crawlTaskData} taskId={crawlTaskId} />
				</Card>

				<Separator />

				<Card className="bg-background/50">
					<CardHeader>
						<CardTitle>2. 生成思维导图</CardTitle>
						<CardDescription>生成每一道题目的思维导图。</CardDescription>
					</CardHeader>
					<CardFooter>
						<Button
							onClick={handleGenerateMindmap}
							disabled={
								!!mindmapTaskId && !['completed', 'failed'].includes(mindmapTaskData?.status ?? '')
							}
						>
							开始生成
						</Button>
					</CardFooter>
					<TaskProgress title="思维导图任务" taskData={mindmapTaskData} taskId={mindmapTaskId} />
				</Card>

				<Separator />

				<Card className="bg-background/50">
					<CardHeader>
						<CardTitle>3. 上传到Anki</CardTitle>
						<CardDescription>将所有题目上传到Anki。</CardDescription>
					</CardHeader>
					<CardFooter>
						<Button
							onClick={handleUploadToAnki}
							disabled={
								!!ankiTaskId && !['completed', 'failed'].includes(ankiTaskData?.status ?? '')
							}
						>
							开始上传
						</Button>
					</CardFooter>
					<TaskProgress title="Anki上传任务" taskData={ankiTaskData} taskId={ankiTaskId} />
				</Card>
			</div>
		</>
	);
}

export default Anki;
