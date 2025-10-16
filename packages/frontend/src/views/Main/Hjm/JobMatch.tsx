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
import type { HjmMatchDto, MatchedJobVo, ResumeVo } from '@prisma-ai/shared';
import { Database } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/badge';
import { useIsMobile } from '../../../hooks/use-mobile';
import { useCustomQuery } from '../../../query/config';
import { JobQueryKey } from '../../../query/keys';
import { getJobCount, getTaskResult, startMatchJobs } from '../../../services/hjm';
import { selectResumeData, setResumeData } from '../../../store/resume';
import { PageHeader } from '../components/PageHeader';
import JobCard from '../Jobs/JobCard';
import Resumes from '../Resumes';

interface PolledTask {
	id: string;
	status: 'pending' | 'processing' | 'completed' | 'failed' | 'running';
	progress?: number;
	error?: string;
}

// 自定义Hook，用于短轮询任务状态
function useTaskPolling(taskId: string | null) {
	const [taskData, setTaskData] = useState<PolledTask | null>(null);
	const [result, setResult] = useState<MatchedJobVo[] | null>(null);

	useEffect(() => {
		if (!taskId) return;
		const interval = setInterval(async () => {
			try {
				const response = await getTaskResult(taskId);
				if (response.code === '0') {
					const { task, result: taskResult } = response.data;
					setTaskData(task as PolledTask);
					if (task.status === 'completed') {
						setResult(taskResult || []);
						clearInterval(interval);
						toast.success('任务完成');
					} else if (task.status === 'failed') {
						clearInterval(interval);
						toast.error(`任务失败: ${task.error}`);
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

	return { taskData, result };
}

export function JobMatch() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const isMobile = useIsMobile();

	const selectedResume = useSelector(selectResumeData);
	const resumeIdToMatch = selectedResume?.resuemIdToMatch;

	const [matchInputs, setMatchInputs] = useState<Omit<HjmMatchDto, 'resumeId'>>({
		topK: 20,
		rerankTopN: 5
	});
	const [matchTaskId, setMatchTaskId] = useState<string | null>(null);

	const { taskData, result } = useTaskPolling(matchTaskId);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setMatchInputs(prev => ({
			...prev,
			[name]: parseInt(value, 10)
		}));
	};

	const handleStartMatch = async () => {
		if (!resumeIdToMatch) {
			toast.error('请先选择一份用于匹配的简历');
			return;
		}
		try {
			const dto: HjmMatchDto = { ...matchInputs, resumeId: resumeIdToMatch };
			const response = await startMatchJobs(dto);
			if (response.code === '0') {
				setMatchTaskId(response.data.id);
				toast.success(`匹配任务已启动，任务ID: ${response.data.id}`);
			} else {
				toast.error(`启动失败: ${response.message}`);
			}
		} catch (error) {
			toast.error(`请求异常: ${(error as Error).message}`);
		}
	};

	//添加选择列
	const ResumeProps = {
		selectColShow: true,
		//将选中状态存储到store
		selectionHandler: (selectedRows: unknown[]) => {
			dispatch(
				setResumeData({
					resuemIdToMatch: (selectedRows[0] as ResumeVo)?.id
				})
			);
		},
		title: '',
		description: '选择要匹配的简历',
		mainTable: false
	};

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
		<div className="pb-7">
			<PageHeader
				title={'简历匹配岗位'}
				description={'通过相似性检索，将您的简历与岗位数据进行匹配'}
			>
				<Button
					variant="outline"
					onClick={() => navigate('/main/hjm/job/get-jobs')}
					className={`flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}
				>
					<Database className={`h-4 w-4 ${isMobile ? 'h-3 w-3' : ''}`} />
					获取岗位数据
				</Button>
			</PageHeader>
			<div className="space-y-6 p-4 md:p-10 pb-16">
				<Card className="bg-background/50">
					<CardHeader>
						<CardTitle>简历匹配岗位</CardTitle>
						<CardDescription>
							选择一份简历后，系统将根据简历内容，在已获取的岗位数据中进行检索和重排，返回最匹配的岗位列表。
						</CardDescription>
						{resumeIdToMatch ? (
							<p className="text-sm text-green-600">已选择简历ID: {resumeIdToMatch}</p>
						) : (
							<p className="text-sm text-yellow-600">请先选择一份用于匹配的简历。</p>
						)}
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid w-full max-w-sm items-center gap-1.5">
							<Label htmlFor="topK">召回数量 (Top K)</Label>
							<Input
								id="topK"
								name="topK"
								type="number"
								value={matchInputs.topK}
								onChange={handleInputChange}
							/>
						</div>
						<div className="grid w-full max-w-sm items-center gap-1.5">
							<Label htmlFor="rerankTopN">重排数量 (Top N)</Label>
							<Input
								id="rerankTopN"
								name="rerankTopN"
								type="number"
								value={matchInputs.rerankTopN}
								onChange={handleInputChange}
							/>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							onClick={handleStartMatch}
							disabled={
								!resumeIdToMatch ||
								(!!matchTaskId && taskData?.status !== 'completed' && taskData?.status !== 'failed')
							}
						>
							开始匹配
						</Button>
					</CardFooter>
					{taskData && (
						<CardContent>
							<p className="text-sm font-medium">匹配任务进度</p>
							<p className="text-sm text-muted-foreground">状态: {taskData.status}</p>
							{taskData.error && <p className="text-sm text-destructive">错误: {taskData.error}</p>}
						</CardContent>
					)}
				</Card>

				{result && (
					<Card className="bg-background/50">
						<CardHeader>
							<CardTitle>匹配结果</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{result.length > 0 ? (
								result.map(job => <JobCard key={job.id} jobData={job} addBtn={true}></JobCard>)
							) : (
								<p>未找到匹配的岗位。</p>
							)}
						</CardContent>
					</Card>
				)}

				<Card className="bg-background/50">
					<CardHeader>
						<CardTitle>
							数据库中的岗位数量 = <Badge variant={'outline'}>{jobCount}</Badge>
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<Resumes {...ResumeProps}></Resumes>
		</div>
	);
}

export default JobMatch;
