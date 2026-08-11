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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectKnowledgeTypeEnum, type PersistentTaskVo, type ProjectKnowledgeVo, type StartCrawlQuestionDto } from '@prisma-ai/shared';
import { Database, ExternalLink, FileText, FileUp, Play, Square, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
	getTaskResult,
	abortTask,
	retryPdfQuestionBankImport,
	startCrawlQuestions,
	startGenerateMindmap,
	startPdfQuestionBankImport,
	startUploadToAnki
} from '../../../services/anki';
import { findAllUserKnowledge } from '../../../services/knowbase';
import { PageHeader } from '../components/PageHeader';
import { browserlessUrl } from '../Hjm/DataCrawl';

// Custom hook to poll task status
function useTaskPolling(taskId: string | null, onTaskComplete?: () => void) {
	const [taskData, setTaskData] = useState<PersistentTaskVo | null>(null);

	useEffect(() => {
		if (!taskId) return;

		const interval = setInterval(async () => {
			try {
				const response = await getTaskResult(taskId);
				if (response.code === '0') {
					const task = response.data.task;
					setTaskData(task);
					if (task.status === 'completed' || task.status === 'failed' || task.status === 'aborted') {
						clearInterval(interval);
						toast.success(`任务 ${task.status}: ${task.error || '已完成'}`);
						// 任务完成后调用回调函数
						onTaskComplete?.();
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
	}, [taskId, onTaskComplete]);

	return taskData;
}

/**
 * 持久化爬虫状态
 * @param isCrawlRunning
 */
function setIsCrawlRunning(isCrawlRunning: boolean) {
	localStorage.setItem('isQuestionCrawlRunning', isCrawlRunning.toString());
}
function getIsCrawlRunning() {
	return localStorage.getItem('isQuestionCrawlRunning') === 'true';
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
	const [pdfTaskId, setPdfTaskId] = useState<string | null>(null);
	const [pdfFiles, setPdfFiles] = useState<File[]>([]);
	const [projectKnowledgeId, setProjectKnowledgeId] = useState<string>('none');
	const [projectCodeBases, setProjectCodeBases] = useState<ProjectKnowledgeVo[]>([]);
	const pdfFileInputRef = useRef<HTMLInputElement>(null);

	// Polling hooks for each task
	const crawlTaskData = useTaskPolling(crawlTaskId, () => {
		setIsCrawlRunning(false);
		setCrawlTaskId(null);
	});
	const mindmapTaskData = useTaskPolling(mindmapTaskId);
	const ankiTaskData = useTaskPolling(ankiTaskId);
	const pdfTaskData = useTaskPolling(pdfTaskId);

	useEffect(() => {
		void findAllUserKnowledge({ page: 1, limit: 1000 }).then(response => {
			if (response.code === '0') {
				setProjectCodeBases(response.data.data.filter(item => item.type === ProjectKnowledgeTypeEnum.userProjectCode));
			}
		});
	}, []);

	const fileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;
	const appendPdfFiles = (files: File[]) => {
		setPdfFiles(previous => {
			const merged = [...previous, ...files.filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))];
			return [...new Map(merged.map(file => [fileKey(file), file])).values()];
		});
	};
	const removePdfFile = (file: File) => setPdfFiles(previous => previous.filter(item => fileKey(item) !== fileKey(file)));

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
		if (getIsCrawlRunning()) {
			toast.warning('爬取任务正在运行，请稍后再试');
			return;
		}
		setIsCrawlRunning(true);
		try {
			const response = await startCrawlQuestions(crawlInputs);
			if (response.code === '0') {
				setCrawlTaskId(response.data.id);
				toast.success(`爬取任务已启动，ID: ${response.data.id}`);
			} else {
				toast.error(`启动失败: ${response.message}`);
				setIsCrawlRunning(false);
			}
		} catch (error) {
			toast.error(`请求异常: ${(error as Error).message}`);
			setIsCrawlRunning(false);
		}
	};

	const handleCancelCrawl = async () => {
		setIsCrawlRunning(false);
		setCrawlTaskId(null);
		toast.success('爬取任务已取消');
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

	const handlePdfImport = async () => {
		if (!pdfFiles.length) {
			toast.warning('请先选择 PDF 文件');
			return;
		}
		try {
			const response = await startPdfQuestionBankImport(pdfFiles, projectKnowledgeId === 'none' ? undefined : projectKnowledgeId);
			if (response.code === '0') {
				setPdfTaskId(response.data.id);
				toast.success(`PDF 题库导入任务已启动，ID: ${response.data.id}`);
			} else toast.error(`启动失败: ${response.message}`);
		} catch (error) {
			toast.error(`请求异常: ${(error as Error).message}`);
		}
	};

	const handleAbortPdfImport = async () => {
		if (!pdfTaskId) return;
		const response = await abortTask(pdfTaskId);
		if (response.code === '0') toast.info('已请求停止导入任务');
		else toast.error(`停止失败: ${response.message}`);
	};

	const handleRetryPdfImport = async () => {
		if (!pdfTaskId) return;
		const response = await retryPdfQuestionBankImport(pdfTaskId);
		if (response.code === '0') setPdfTaskId(response.data.id);
		else toast.error(`重试失败: ${response.message}`);
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

	// 检查是否有正在运行的任务
	const isTaskRunning =
		(crawlTaskId && crawlTaskData && !['completed', 'failed'].includes(crawlTaskData.status)) ||
		getIsCrawlRunning();

	return (
		<>
			<PageHeader
				title={'集成面试题库和 anki'}
				description={'从外部网站获取题库数据，进行处理并上传到 Anki。'}
			>
				{' '}
				<div className="flex flex-wrap gap-3">
					<Button
						variant="outline"
						onClick={() => window.open('https://pinkprisma.com', '_blank')}
						className="flex items-center gap-2"
					>
						<Database className="h-4 w-4" />
						PrismaAI Hub
					</Button>
				</div>
			</PageHeader>
			<div className="space-y-6 p-4">
				<Card className="border-primary/30 bg-background/50">
					<CardHeader>
						<CardTitle>智能 PDF 题库导入</CardTitle>
						<CardDescription>从 PDF 提取面试题，生成答案、思维导图并导入 Anki。</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label>关联项目代码库（可选）</Label>
							<Select value={projectKnowledgeId} onValueChange={setProjectKnowledgeId}>
								<SelectTrigger className="w-full max-w-xl"><SelectValue placeholder="不关联项目代码库" /></SelectTrigger>
								<SelectContent>
									<SelectItem value="none">不关联项目代码库</SelectItem>
									{projectCodeBases.map(item => <SelectItem key={item.id} value={item.id}>{item.name} ({item.content})</SelectItem>)}
								</SelectContent>
							</Select>
						</div>
						<div className="rounded-md border border-dashed p-4">
							<input ref={pdfFileInputRef} className="sr-only" type="file" multiple accept=".pdf,application/pdf" onChange={event => { appendPdfFiles(Array.from(event.target.files ?? [])); event.currentTarget.value = ''; }} />
							<div className="flex flex-wrap items-center gap-3">
								<Button type="button" variant="outline" onClick={() => pdfFileInputRef.current?.click()}><FileUp />选择 PDF</Button>
								<span className="text-sm text-muted-foreground">已选择 {pdfFiles.length} 个文件</span>
								{pdfFiles.length > 0 && <Button type="button" variant="outline" size="icon" title="清空已选文件" aria-label="清空已选文件" onClick={() => setPdfFiles([])}><Trash2 /></Button>}
							</div>
							{pdfFiles.length > 0 && <div className="mt-3 max-h-52 space-y-2 overflow-y-auto">
								{pdfFiles.map(file => <div key={fileKey(file)} className="flex min-h-10 items-center gap-3 rounded-md border bg-muted/20 px-3 py-2 text-sm">
									<FileText className="size-4 shrink-0 text-muted-foreground" />
									<span className="min-w-0 flex-1 truncate" title={file.name}>{file.name}</span>
									<span className="shrink-0 text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
									<Button type="button" variant="outline" size="icon" title={`移除 ${file.name}`} aria-label={`移除 ${file.name}`} onClick={() => removePdfFile(file)}><X /></Button>
								</div>)}
							</div>}
						</div>
					</CardContent>
					<CardFooter className="flex flex-wrap gap-3">
						<Button onClick={handlePdfImport} disabled={!pdfFiles.length || (!!pdfTaskId && !['completed', 'failed', 'aborted'].includes(pdfTaskData?.status ?? ''))}><Play />开始导入</Button>
						{pdfTaskId && ['pending', 'running'].includes(pdfTaskData?.status ?? '') && <Button variant="destructive" onClick={handleAbortPdfImport}><Square />停止导入</Button>}
						{pdfTaskId && ['failed', 'aborted'].includes(pdfTaskData?.status ?? '') && <Button variant="outline" onClick={handleRetryPdfImport}>重试失败项</Button>}
					</CardFooter>
					{pdfTaskData && <CardContent>
						<p className="text-sm font-medium">PDF 导入进度</p>
						<p className="text-sm text-muted-foreground">状态: {pdfTaskData.status}</p>
						<p className="text-sm text-muted-foreground">{pdfTaskData.progress?.completedCount ?? 0} / {pdfTaskData.progress?.totalCount ?? '?'}</p>
						{pdfTaskData.error && <p className="text-sm text-destructive">错误: {pdfTaskData.error}</p>}
					</CardContent>}
				</Card>
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
						{!isTaskRunning ? (
							<Button
								onClick={handleStartCrawl}
								disabled={!crawlInputs.domain || !crawlInputs.list}
							>
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
					<TaskProgress title="爬取任务" taskData={crawlTaskData} taskId={crawlTaskId} />
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
