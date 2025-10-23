import { useTheme } from '@/utils/theme';
import {
	jsonMd_obj,
	ResumeStatus,
	type JobVo,
	type MatchJobDto,
	type ResumeMatchedDto,
	type ResumeVo
} from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useCustomQuery } from '../../../../query/config';
import { JobQueryKey, ResumeQueryKey } from '../../../../query/keys';
import { findAllUserJobs } from '../../../../services/job';
import { findAllUserResumes } from '../../../../services/resume';
import { useSseAnswer } from '../../../../services/sse/useSseAnswer';
import { selectJobModel } from '../../../../store/jobs';
import JobCard from '../../Jobs/JobCard';
import { OriginalResume } from './components/OriginalResume';
import { ResumeResult } from './components/ResumeResult';

//llm返回的json
type MatchResultDto = ResumeMatchedDto;

interface ResumeActionsProps {
	_?: string;
}

/**
 * 简历操作页面
 * @description 包含简历详情展示和AI操作（如岗位匹配）
 */
const ResumeActions: React.FC<ResumeActionsProps> = () => {
	const { resumeId, jobId } = useParams();
	const { data, status } = useCustomQuery([ResumeQueryKey.Resumes, 1, 1000], ({ queryKey }) => {
		const [, page, limit] = queryKey;
		return findAllUserResumes(page as number, limit as number);
	});
	const { data: jobDataResult, status: jobStatus } = useCustomQuery([JobQueryKey.Jobs], () =>
		findAllUserJobs(1, 1000)
	);
	const model = useSelector(selectJobModel);
	const queryClient = useQueryClient();
	// const { data: resumeMatchedData, status: resumeMatchedStatus } = useCustomQuery(
	// 	[ResumeQueryKey.ResumeMatched, jobId],
	// 	() => findResumeMatchedByJobId(jobId as string)
	// );

	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';
	const navigate = useNavigate();

	// 控制式 Hook：显式触发
	const { content, reasonContent, done, isReasoning, start } = useSseAnswer();
	const [resultData, setResultData] = useState<MatchResultDto | null>(null);

	/* 使用SSE获取AI生成结果（显式触发） */

	/* 自动切换tab */
	useEffect(() => {
		if (content) {
			navigate('#content');
		}
	}, [content, navigate]);

	useEffect(() => {
		if (done) {
			const result = jsonMd_obj(content);
			console.log('🚀 ~ sse最终结果', result);
			setResultData(result);
			//setState异步, 需要等待setState执行完再执行navigate
			setTimeout(() => navigate('#result'), 0);
		}
	}, [done]);

	if (status === 'pending' || jobStatus === 'pending') {
		return <div className="flex justify-center items-center h-64"></div>;
	}

	if (status === 'error' || jobStatus === 'error') {
		return (
			<div className="text-center text-red-500">
				错误: {(data?.message ?? '未知错误,请与支持人员联系') + (jobDataResult?.message ?? '')}
			</div>
		);
	}

	const resumeDatas = data.data.data;
	const jobDatas = jobDataResult.data.data;
	const resumeData: ResumeVo | undefined = resumeDatas?.find(resume => resume.id === resumeId);
	const jobData: JobVo | undefined = jobDatas?.find(job => job.id === jobId);
	if (!resumeData || resumeId === undefined) {
		return <div className="text-center text-gray-500">没有找到简历数据</div>;
	}
	if (!jobData || jobId === undefined) {
		return <div className="text-center text-gray-500">没有找到岗位数据</div>;
	}

	const getAvailableActions = (status: ResumeStatus) => {
		switch (status) {
			case ResumeStatus.committed:
				return ['match'];
			case ResumeStatus.matched:
				return ['match'];
			default:
				return ['match'];
		}
	};

	const availableActions = getAvailableActions(resumeData.status);
	const actionType: 'match' | 'collaborate' | null = availableActions[0] as
		| 'match'
		| 'collaborate'
		| null;

	/**
	 * 处理简历与岗位的匹配操作
	 */
	const handleMatch = () => {
		if (!resumeId || !jobId) {
			toast.error('请选择简历和岗位');
			setTimeout(() => {
				navigate('/job');
			}, 1000);
			return;
		}
		const matchJobDto: MatchJobDto = {
			resume: resumeId,
			job: jobId
		};
		start({ path: '/resume/match', input: { input: matchJobDto }, model });
		navigate('#reasoning');
	};

	/**
	 * 用户点击接受结果,并更新所有状态
	 */
	const handleMerge = () => {
		queryClient.invalidateQueries({ queryKey: [ResumeQueryKey.Resumes] });
		navigate('#next-action');
	};

	/**
	 * 用户点击不满意后重新调用llm
	 * @param content 反馈内容
	 */
	const handleFeedback = (content: string) => {
		const matchJobDto: MatchJobDto = {
			resume: resumeId,
			job: jobId
		};
		switch (actionType) {
			case 'match':
				if (!resumeId || !jobId) {
					toast.error('请选择简历和岗位');
					setTimeout(() => {
						navigate('/job');
					}, 1000);
					return;
				}
				start({
					path: '/resume/match',
					input: { input: matchJobDto, userFeedback: { reflect: true, content } },
					model
				});
				break;
			default:
				break;
		}
		navigate('#reasoning');
	};

	const ResumeResultProps = {
		resultData,
		resumeData,
		mergedData: null,
		actionType,
		availableActions,
		handleMatch,
		handleMerge,
		handleFeedback,
		content,
		reasonContent,
		done,
		isReasoning
	};

	return (
		<div className={`transition-colors duration-200 bg-global`}>
			<div className="container mx-auto px-4 py-8">
				{/* 两栏布局 */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
					{/* 左栏：原始简历信息 */}
					<div className="overflow-y-auto h-fit space-y-8">
						<OriginalResume resumeData={resumeData} isDark={isDark} />
						<JobCard jobData={jobData} />
					</div>

					{/* 右栏：AI行动区域 */}
					<ResumeResult {...ResumeResultProps} />
				</div>
			</div>
		</div>
	);
};

export default ResumeActions;
