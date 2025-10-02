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
import { Separator } from '@/components/ui/separator';
import type {
	CreateProjectDeepWikiKnowledgeDto,
	DeepWikiKnowledgeDto,
	PersistentTaskVo,
	ProjectKnowledgeTypeEnum
} from '@prisma-ai/shared';
import { Play, Square } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
	downloadDeepWiki,
	getDeepWikiTaskResult,
	uploadDeepWikiToKnowledgeBase
} from '../../../services/knowledge-base/project-deepwiki';
import { PageHeader } from '../components/PageHeader';

// 自定义Hook：任务轮询
function useTaskPolling(taskId: string | null, onTaskComplete?: () => void) {
	const [taskData, setTaskData] = useState<PersistentTaskVo | null>(null);

	useEffect(() => {
		if (!taskId) return;

		const interval = setInterval(async () => {
			try {
				const response = await getDeepWikiTaskResult(taskId);
				if (response.code === '0') {
					const task = response.data.task;
					setTaskData(task);
					if (task.status === 'completed' || task.status === 'failed') {
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
 * URL校验和参数提取工具函数
 * @param url DeepWiki URL
 * @returns 解析结果或null
 */
function parseDeepWikiUrl(url: string): {
	organization: string;
	repository: string;
	isValid: boolean;
} | null {
	try {
		// 清理URL末尾的斜杠
		const cleanedUrl = url.trim().replace(/\/$/, '');

		// 校验URL格式：https://deepwiki.com/{organization}/{repository}
		const urlPattern = /^https:\/\/deepwiki\.com\/([^/]+)\/([^/]+)$/;
		const match = cleanedUrl.match(urlPattern);

		if (!match) {
			return null;
		}

		const [, organization, repository] = match;

		if (!organization || !repository) {
			return null;
		}

		return {
			organization,
			repository,
			isValid: true
		};
	} catch {
		return null;
	}
}

/**
 * 持久化下载任务状态
 */
function setIsDownloadRunning(isRunning: boolean) {
	localStorage.setItem('isDeepWikiDownloadRunning', isRunning.toString());
}

function getIsDownloadRunning() {
	return localStorage.getItem('isDeepWikiDownloadRunning') === 'true';
}

/**
 * 持久化上传任务状态
 */
function setIsUploadRunning(isRunning: boolean) {
	localStorage.setItem('isDeepWikiUploadRunning', isRunning.toString());
}

function getIsUploadRunning() {
	return localStorage.getItem('isDeepWikiUploadRunning') === 'true';
}

export function Deepwiki() {
	// 状态管理
	const [wikiUrl, setWikiUrl] = useState<string>('');
	const [downloadTaskId, setDownloadTaskId] = useState<string | null>(null);
	const [uploadTaskId, setUploadTaskId] = useState<string | null>(null);

	// 任务轮询Hooks
	const downloadTaskData = useTaskPolling(downloadTaskId, () => {
		setIsDownloadRunning(false);
		setDownloadTaskId(null);
	});

	const uploadTaskData = useTaskPolling(uploadTaskId, () => {
		setIsUploadRunning(false);
		setUploadTaskId(null);
	});

	// 获取任务进度百分比
	const getProgress = (task: PersistentTaskVo | null) => {
		if (!task) return 0;
		if (task.status === 'completed') return 100;
		if (task.progress && task.progress.totalCount > 0) {
			return (task.progress.completedCount / task.progress.totalCount) * 100;
		}
		return 0;
	};

	// URL输入处理
	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setWikiUrl(e.target.value);
	};

	// 开始下载DeepWiki站点
	const handleStartDownload = async () => {
		if (getIsDownloadRunning()) {
			toast.warning('下载任务正在运行，请稍后再试');
			return;
		}

		const parsedUrl = parseDeepWikiUrl(wikiUrl);
		if (!parsedUrl) {
			toast.error(
				'URL格式错误，请输入正确的DeepWiki URL格式：https://deepwiki.com/{organization}/{repository}'
			);
			return;
		}

		setIsDownloadRunning(true);
		try {
			const dto: DeepWikiKnowledgeDto = { wikiUrl };
			const response = await downloadDeepWiki(dto);
			if (response.code === '0') {
				setDownloadTaskId(response.data.id);
				toast.success(`下载任务已启动，ID: ${response.data.id}`);
			} else {
				toast.error(`启动失败: ${response.message}`);
				setIsDownloadRunning(false);
			}
		} catch (error) {
			toast.error(`请求异常: ${(error as Error).message}`);
			setIsDownloadRunning(false);
		}
	};

	// 取消下载任务
	const handleCancelDownload = async () => {
		setIsDownloadRunning(false);
		setDownloadTaskId(null);
		toast.success('下载任务已取消');
	};

	// 开始上传到知识库
	const handleStartUpload = async () => {
		if (getIsUploadRunning()) {
			toast.warning('上传任务正在运行，请稍后再试');
			return;
		}

		const parsedUrl = parseDeepWikiUrl(wikiUrl);
		if (!parsedUrl) {
			toast.error(
				'URL格式错误，请输入正确的DeepWiki URL格式：https://deepwiki.com/{organization}/{repository}'
			);
			return;
		}

		setIsUploadRunning(true);
		try {
			const dto: CreateProjectDeepWikiKnowledgeDto = {
				name: `${parsedUrl.repository}-deepwiki`,
				projectName: parsedUrl.repository,
				type: 'userProjectDeepWiki' as ProjectKnowledgeTypeEnum.userProjectDeepWiki,
				wikiUrl
			};

			const response = await uploadDeepWikiToKnowledgeBase(dto);
			if (response.code === '0') {
				setUploadTaskId(response.data.id);
				toast.success(`上传任务已启动，ID: ${response.data.id}`);
			} else {
				toast.error(`启动失败: ${response.message}`);
				setIsUploadRunning(false);
			}
		} catch (error) {
			toast.error(`请求异常: ${(error as Error).message}`);
			setIsUploadRunning(false);
		}
	};

	// 取消上传任务
	const handleCancelUpload = async () => {
		setIsUploadRunning(false);
		setUploadTaskId(null);
		toast.success('上传任务已取消');
	};

	// 任务进度组件
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
	const isDownloadTaskRunning =
		(downloadTaskId &&
			downloadTaskData &&
			!['completed', 'failed'].includes(downloadTaskData.status)) ||
		getIsDownloadRunning();

	const isUploadTaskRunning =
		(uploadTaskId && uploadTaskData && !['completed', 'failed'].includes(uploadTaskData.status)) ||
		getIsUploadRunning();

	// 解析URL获取项目信息用于显示
	const parsedUrl = parseDeepWikiUrl(wikiUrl);

	return (
		<>
			<PageHeader
				title={'DeepWiki 知识库集成'}
				description={
					'从 DeepWiki 网站下载你的项目文档并导入到知识库中。请先在 Deepwiki 网站生成项目文档。'
				}
			></PageHeader>
			<div className="space-y-6 p-4">
				{/* URL输入区域 */}
				<Card className="bg-background/50">
					<CardHeader>
						<CardTitle>输入项目 DeepWiki URL </CardTitle>
						<CardDescription>
							请输入DeepWiki项目地址，格式：https://deepwiki.com/organization/repository
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid w-full max-w-lg items-center gap-1.5">
							<Input
								id="wikiUrl"
								name="wikiUrl"
								value={wikiUrl}
								onChange={handleUrlChange}
								placeholder="例如: https://deepwiki.com/microsoft/vscode"
							/>
							{parsedUrl && (
								<div className="text-sm text-muted-foreground mt-2">
									<p>组织: {parsedUrl.organization}</p>
									<p>仓库: {parsedUrl.repository}</p>
									<p>知识库名称: {parsedUrl.repository}-deepwiki</p>
									<p>项目名称: {parsedUrl.repository}</p>
								</div>
							)}
							{wikiUrl && !parsedUrl && (
								<p className="text-sm text-destructive mt-2">
									URL格式不正确，请使用格式：https://deepwiki.com/organization/repository
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* 步骤1：下载DeepWiki站点 */}
				<Card className="bg-background/50">
					<CardHeader>
						<CardTitle>1. 下载DeepWiki站点</CardTitle>
						<CardDescription>将DeepWiki网站内容下载为Markdown文件保存到本地。</CardDescription>
					</CardHeader>
					<CardFooter>
						{!isDownloadTaskRunning ? (
							<Button onClick={handleStartDownload} disabled={!wikiUrl || !parsedUrl}>
								<Play className="mr-2 h-4 w-4" />
								开始下载
							</Button>
						) : (
							<Button onClick={handleCancelDownload} variant="destructive">
								<Square className="mr-2 h-4 w-4" />
								取消下载
							</Button>
						)}
					</CardFooter>
					<TaskProgress title="下载任务" taskData={downloadTaskData} taskId={downloadTaskId} />
				</Card>

				{/* 步骤2：上传到知识库 */}
				<Card className="bg-background/50">
					<CardHeader>
						<CardTitle>2. 上传到知识库</CardTitle>
						<CardDescription>将下载的Markdown文件上传到项目知识库中。</CardDescription>
					</CardHeader>
					<CardFooter>
						{!isUploadTaskRunning ? (
							<Button onClick={handleStartUpload} disabled={!wikiUrl || !parsedUrl}>
								<Play className="mr-2 h-4 w-4" />
								开始上传
							</Button>
						) : (
							<Button onClick={handleCancelUpload} variant="destructive">
								<Square className="mr-2 h-4 w-4" />
								取消上传
							</Button>
						)}
					</CardFooter>
					<TaskProgress title="上传任务" taskData={uploadTaskData} taskId={uploadTaskId} />
				</Card>

				{/* 显示运行状态提示 */}
				{(getIsDownloadRunning() || getIsUploadRunning()) && (
					<>
						<Separator />
						<Card className="bg-background/50">
							<CardHeader>
								<CardTitle>任务正在执行</CardTitle>
								<CardDescription>
									{getIsDownloadRunning() && '下载任务正在后台执行。'}
									{getIsUploadRunning() && '上传任务正在后台执行。'}
									您可以在此页面查看实时进度。
								</CardDescription>
							</CardHeader>
						</Card>
					</>
				)}
			</div>
		</>
	);
}

export default Deepwiki;
