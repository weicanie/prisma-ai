import { useTheme } from '@/utils/theme';
import {
	type ImplementDto,
	jsonMd_obj,
	type lookupResultDto,
	type ProjectDto,
	type projectLookupedDto,
	type ProjectMinedDto,
	ProjectStatus
} from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { ProjectQueryKey } from '../../../query/keys';
import { findAllProjects, implementProject } from '../../../services/project';
import { useSseAnswer } from '../../../services/sse/useSseAnswer';
import { selectProjectLLM } from '../../../store/projects';
import { OriginalProject } from './components/OriginalProject';
import { ProjectResult } from './components/ProjectResult';
//TODO 将调用llm、获取sse返回过程封装成一个统一的组件
interface ActionProps {
	_?: string;
}

enum ActionType {
	lookup = 'lookup',
	polish = 'polish',
	mine = 'mine',
	collaborate = 'collaborate'
}

const Action: React.FC<ActionProps> = () => {
	const { projectId } = useParams();
	const { data, status } = useCustomQuery([ProjectQueryKey.Projects], findAllProjects);
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	const navigate = useNavigate();

	// 控制式 Hook：显式触发
	const { content, reasonContent, done, isReasoning, start } = useSseAnswer();
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

	const model = useSelector(selectProjectLLM);

	/* 自动切换tab */
	useEffect(() => {
		if (content) {
			navigate('#content');
		}
	}, [content]);

	useEffect(() => {
		if (done) {
			const result = jsonMd_obj(content);
			if (Array.isArray(result)) {
				const [resultData, mergedData] = result;
				console.log('sse最终结果:', result);

				setResultData(resultData);
				if (mergedData) {
					setMergedData(mergedData); //[结果]支持
				}
			} else {
				setResultData(result);
			}

			//setState异步, 需要等待setState执行完再执行navigate
			setTimeout(() => {
				navigate('#result');
			}, 0);
		}
	}, [done]);

	/**
	 * llm生成结果对应的操作类型，影响结果的展示和反思重做的调用
	 * 1. 如果项目状态为lookuped，则操作类型为lookup
	 * 2. 如果项目状态为polished，则操作类型为polish
	 * 3. 如果项目状态为mined，则操作类型为mine
	 * 4. 否则为collaborate
	 */
	const [actionType, setActionType] = useState<ActionType>(ActionType.lookup);

	const ImplementRequest = useCustomMutation(implementProject);

	if (status === 'pending') {
		return <div className="flex justify-center items-center h-64">Loading...</div>;
	}

	if (status === 'error') {
		return <div className="text-center text-red-500">错误: {data?.message}</div>;
	}

	const projectDatas = data.data;
	const projectData = projectDatas?.find(project => project.id === projectId);

	if (!projectData || projectId === undefined) {
		return <div className="text-center text-gray-500">没有找到项目经验数据</div>;
	}

	// 根据项目状态确定可用操作
	const getAvailableActions = (status: ProjectStatus) => {
		const availableActions = ['mine', 'collaborate'];
		if (status === ProjectStatus.lookuped) {
			availableActions.push('polish');
		} else {
			availableActions.push('lookup');
		}
		return availableActions;
	};
	const availableActions = getAvailableActions(projectData.status);

	// 处理AI分析
	const handleLookup = () => {
		const projectDto: ProjectDto = {
			info: projectData.info,
			lightspot: projectData.lightspot
		};
		start({ path: '/project/lookup', input: { input: projectDto }, model });
		setActionType(ActionType.lookup);
		navigate('#reasoning');
	};

	// 处理AI打磨
	const handlePolish = () => {
		const projectLookupedDto: projectLookupedDto = {
			info: projectData.info,
			lightspot: projectData.lightspot,
			lookupResult: projectData.lookupResult!
		};
		start({ path: '/project/polish', input: { input: projectLookupedDto }, model });
		setActionType(ActionType.polish);
		navigate('#reasoning');
	};

	// 处理AI挖掘
	const handleMine = () => {
		const projectDto: ProjectDto = {
			info: projectData.info,
			lightspot: projectData.lightspot
		};
		start({ path: '/project/mine', input: { input: projectDto }, model });
		setActionType(ActionType.mine);
		navigate('#reasoning');
	};

	// 处理和 Agent 协作实现亮点
	/**
	 * @param content 用户想要实现的项目亮点
	 * @param projectPath 项目路径（项目名称）
	 */
	const handleCollaborate = (content: string, projectPath: string) => {
		const implementDto: ImplementDto = {
			projectId: projectData.id,
			lightspot: content,
			projectPath
		};
		ImplementRequest.mutate(implementDto);
		setActionType(ActionType.collaborate);
	};

	/* 用户点击完成优化后更新左侧的项目经验,并更新所有状态 */
	const handleMerge = () => {
		queryClient.invalidateQueries({ queryKey: [ProjectQueryKey.Projects] });
		navigate('#next-action');
	};

	/**
	 * 用户提交反馈后重新调用llm
	 * @param content 反馈内容
	 */
	const handleFeedback = (content: string) => {
		switch (actionType) {
			case 'lookup':
				start({
					path: '/project/lookup',
					input: {
						input: projectData,
						userFeedback: { reflect: true, content }
					},
					model
				});
				break;
			case 'polish': {
				const projectLookupedDto: projectLookupedDto = {
					info: projectData.info,
					lightspot: projectData.lightspot,
					lookupResult: projectData.lookupResult!
				};
				start({
					path: '/project/polish',
					input: {
						input: projectLookupedDto,
						userFeedback: { reflect: true, content }
					},
					model
				});
				break;
			}
			case 'mine':
				start({
					path: '/project/mine',
					input: {
						input: projectData,
						userFeedback: { reflect: true, content }
					},
					model
				});
				break;
			default:
				break;
		}
		navigate('#reasoning');
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
		handleFeedback,
		content,
		reasonContent,
		done,
		isReasoning
	};

	return (
		<div className={`min-h-screen transition-colors duration-200 bg-global`}>
			<div className="container mx-auto px-4 py-8">
				{/* 页面标题 */}
				{/* <PageHeader title="项目经验优化" description="让 doro 深度优化您的项目经验"></PageHeader> */}

				{/* 两栏布局 */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
					{/* 左栏：原始项目信息 */}
					<div className="overflow-y-auto">
						<OriginalProject projectData={projectData} isDark={isDark} />
					</div>

					{/* 右栏：AI行动区域 */}
					<ProjectResult {...ProjectResultProps} />
				</div>
			</div>
		</div>
	);
};

export default Action;
