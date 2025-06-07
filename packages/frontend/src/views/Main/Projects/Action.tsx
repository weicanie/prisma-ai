import { useTheme } from '@/utils/theme';
import {
	jsonMd_obj,
	type lookupResultDto,
	type ProjectDto,
	type projectLookupedDto,
	type ProjectMinedDto,
	ProjectStatus
} from '@prism-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCustomQuery } from '../../../query/config';
import { ProjectQueryKey } from '../../../query/keys';
import { findAllProjects } from '../../../services/project';
import { useSseAnswer } from '../../../services/sse/useSseAnswer';
import { OriginalProject } from './Action-Result/OriginalProject';
import { ProjectResult } from './Action-Result/ProjectResult';

interface ActionProps {}

export const Action: React.FC<ActionProps> = () => {
	const { projectIndex } = useParams();
	const { data, status } = useCustomQuery([ProjectQueryKey.Projects], findAllProjects);
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	const [input, setInput] = useState<ProjectDto | {}>({});
	//目标接口的URL path
	const [target, setTarget] = useState('');
	/**
	 * 流式传输结束时string转为的JSON格式对象数据-原结果
	 */
	const [resultData, setResultData] = useState<
		lookupResultDto | ProjectMinedDto | ProjectMinedDto | null
	>(null);
	/**
	 * 流式传输结束时string转为的JSON格式对象数据-合并后的结果
	 */
	const [mergedData, setMergedData] = useState<ProjectDto | null>(null);

	const queryClient = useQueryClient();

	/* 使用SSE获取AI生成结果 */
	const { content, reasonContent, done, isReasoning } = useSseAnswer(input, target);
	const [actionType, setActionType] = useState<'lookup' | 'polish' | 'mine' | null>(null);

	useEffect(() => {
		if (done) {
			const result = jsonMd_obj(content);
			if (Array.isArray(result)) {
				const [resultData, mergedData] = result;
				console.log('🚀 ~ useEffect ~ mergedData:', mergedData);
				console.log('🚀 ~ useEffect ~ resultData:', resultData);
				setResultData(resultData);
				mergedData && setMergedData(mergedData); //[结果]支持
			} else {
				setResultData(result);
			}

			setInput({}); // 清空输入防止sse重复请求
		}
	}, [done]);

	if (status === 'pending') {
		return <div className="flex justify-center items-center h-64">Loading...</div>;
	}

	if (status === 'error') {
		return <div className="text-center text-red-500">错误: {data?.message}</div>;
	}

	const projectDatas = data.data;
	const projectData = projectDatas?.[+projectIndex!];

	if (!projectData || projectIndex === undefined) {
		return <div className="text-center text-gray-500">没有找到项目经验数据</div>;
	}

	// 根据项目状态确定可用操作
	const getAvailableActions = (status: ProjectStatus) => {
		switch (status) {
			case ProjectStatus.committed:
				return ['lookup'];
			case ProjectStatus.lookuped:
			case ProjectStatus.polishing:
				return ['polish'];
			case ProjectStatus.polished:
			case ProjectStatus.mining:
				return ['mine'];
			case ProjectStatus.mined:
			case ProjectStatus.accepted:
				return ['collaborate'];
			default:
				return [];
		}
	};

	const availableActions = getAvailableActions(projectData.status);

	// 处理AI分析
	const handleLookup = () => {
		const projectDto: ProjectDto = {
			info: projectData.info,
			lightspot: projectData.lightspot
		};
		setActionType('lookup');
		setInput(projectDto);
		setTarget('/project/lookup');
	};

	// 处理AI打磨
	const handlePolish = () => {
		const projectLookupedDto: projectLookupedDto = {
			info: projectData.info,
			lightspot: projectData.lightspot,
			lookupResult: projectData.lookupResult!
		};
		console.log('🚀 ~ handlePolish ~ projectLookupedDto:', projectLookupedDto);
		setActionType('polish');
		setInput(projectLookupedDto);
		setTarget('/project/polish');
	};

	// 处理AI挖掘
	const handleMine = () => {
		const projectDto: ProjectDto = {
			info: projectData.info,
			lightspot: projectData.lightspot
		};
		setActionType('mine');
		setInput(projectDto);
		setTarget('/project/mine');
	};

	// 处理协作
	const handleCollaborate = () => {
		// TODO: 实现与项目经验优化 agent 的协作功能
		console.log('启动与AI agent的协作');
	};

	/* 用户点击完成优化后更新左侧的项目经验,并清理所有状态 */
	const handleMerge = () => {
		queryClient.invalidateQueries({ queryKey: [ProjectQueryKey.Projects] });
		setInput({});
		setResultData(null);
		setMergedData(null);
		setActionType(null);
		setTarget('polish');
	};

	const ProjectResultProps = {
		resultData,
		mergedData,
		actionType,
		availableActions,
		handleLookup,
		handlePolish,
		handleMine,
		handleCollaborate,
		handleMerge,
		content,
		reasonContent,
		done,
		isReasoning
	};

	return (
		<div className={`min-h-screen transition-colors duration-200 bg-global`}>
			<div className="container mx-auto px-4 py-8">
				{/* 页面标题 */}
				{/* <PageHeader title="项目经验优化" description="让 Prisma 深度优化您的项目经验"></PageHeader> */}

				{/* 两栏布局 */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
					{/* 左栏：原始项目信息 */}
					<div className="overflow-y-auto">
						<OriginalProject
							projectData={projectData}
							projectIndex={projectIndex}
							isDark={isDark}
						/>
					</div>

					{/* 右栏：AI行动区域 */}
					<div className="overflow-y-auto scb-thin ">
						<ProjectResult {...ProjectResultProps} />
					</div>
				</div>
			</div>
		</div>
	);
};
export default Action;
