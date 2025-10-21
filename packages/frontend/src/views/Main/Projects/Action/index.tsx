import { useCustomMutation, useCustomQuery } from '@/query/config';
import { ProjectQueryKey } from '@/query/keys';
import { findAllProjects, implementProject } from '@/services/project';
import { useSseAnswer } from '@/services/sse/useSseAnswer';
import { selectProjectLLM } from '@/store/projects';
import { useTheme } from '@/utils/theme';
import {
	type ImplementDto,
	jsonMd_obj,
	type lookupResultDto,
	type ProjectDto,
	type projectLookupedDto,
	type ProjectMinedDto,
	projectMinedSchema,
	type ProjectPolishedDto,
	projectPolishedSchema,
	projectSchema,
	ProjectStatus
} from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { z } from 'zod';
import { OriginalProject } from './components/OriginalProject';
import { ProjectResult } from './components/ProjectResult';
import { type ActionHandlers, ActionType } from './type';

interface ActionProps {
	_?: string;
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
		lookupResultDto | ProjectMinedDto | ProjectPolishedDto | string | null
	>(null);
	/**
	 * 流式传输结束时string转为的JSON格式对象数据-合并后的结果
	 */
	const [mergedData, setMergedData] = useState<ProjectDto | null>(null);

	const queryClient = useQueryClient();

	const model = useSelector(selectProjectLLM);

	/**
	 * 用户所选操作
	 */
	const [actionType, setActionType] = useState<ActionType>(ActionType.lookup);

	/* 自动切换tab */
	useEffect(() => {
		if (content) {
			navigate('#content');
		}
	}, [content]);

	useEffect(() => {
		if (done) {
			if (actionType === ActionType.businessLookup || actionType === ActionType.businessPaper) {
				setResultData(content);
			} else {
				try {
					const result: {
						after: z.infer<typeof projectSchema>;
						before: z.infer<typeof projectPolishedSchema> | z.infer<typeof projectMinedSchema>;
					} = jsonMd_obj(content);
					setResultData(result.before);
					setMergedData(result.after);
					console.log('sse 最终结果：', result);
				} catch (error) {
					//! 续传的情况，actionType是初始值，因此需要尝试解析为字符串（businessLookup、businessPaper）
					if (content.search(/[{}]/gm) === -1) {
						//不是json格式，则认为是字符串
						setResultData(content);
					} else {
						toast.error('结果解析错误，请稍后重试生成');
						console.error('jsonMd_obj error', error);
					}
				}
			}
			//setState异步, 需要等待setState执行完再执行navigate
			setTimeout(() => {
				navigate('#result');
			}, 0);
		}
	}, [done]);

	const ImplementRequest = useCustomMutation(implementProject);

	if (status === 'pending') {
		return <div className="flex justify-center items-center h-64"></div>;
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
		const isOnline = import.meta.env.VITE_IS_ONLINE === 'true';

		const availableActions = isOnline ? ['mine'] : ['mine', 'collaborate'];
		// lookup后才能polish
		if (status === ProjectStatus.lookuped) {
			availableActions.push('polish');
		} else {
			availableActions.push('lookup');
		}
		// 'businessLookup'后才能'businessPaper'
		if (status === ProjectStatus.businessLookuped) {
			availableActions.push('businessPaper');
		} else {
			availableActions.push('businessLookup');
		}
		return availableActions;
	};
	const availableActions = getAvailableActions(projectData.status);

	// 处理AI分析
	const handleLookup = () => {
		const projectDto: ProjectDto = {
			name: projectData.name,
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
			name: projectData.name,
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
			name: projectData.name,
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
						input: {
							name: projectData.name,
							info: projectData.info,
							lightspot: projectData.lightspot
						},
						userFeedback: { reflect: true, content }
					},
					model
				});
				break;
			case 'polish': {
				const projectLookupedDto: projectLookupedDto = {
					name: projectData.name,
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
						input: {
							name: projectData.name,
							info: projectData.info,
							lightspot: projectData.lightspot
						},
						userFeedback: { reflect: true, content }
					},
					model
				});
				break;
			case 'businessLookup':
				start({
					path: '/project/business-lookup',
					input: { input: projectData, userFeedback: { reflect: true, content } },
					model
				});
				break;
			case 'businessPaper':
				start({
					path: '/project/business-paper',
					input: { input: projectData, userFeedback: { reflect: true, content } },
					model
				});
				break;
			default:
				break;
		}
		navigate('#reasoning');
	};

	const handleBusinessLookup = () => {
		start({ path: '/project/business-lookup', input: { input: projectData }, model });
		setActionType(ActionType.businessLookup);
		navigate('#reasoning');
	};

	const handleBusinessPaper = () => {
		start({ path: '/project/business-paper', input: { input: projectData }, model });
		setActionType(ActionType.businessPaper);
		navigate('#reasoning');
	};

	const actionHandlers: ActionHandlers = {
		lookup: handleLookup,
		polish: handlePolish,
		mine: handleMine,
		collaborate: handleCollaborate,
		businessLookup: handleBusinessLookup,
		businessPaper: handleBusinessPaper
	};

	const ProjectResultProps = {
		resultData,
		mergedData,
		actionType,
		availableActions,
		actionHandlers,
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
					{/* 左栏：原始项目信息 */}
					<OriginalProject projectData={projectData} isDark={isDark} />
					{/* 右栏：AI行动区域 */}
					<ProjectResult {...ProjectResultProps} />
				</div>
			</div>
		</div>
	);
};

export default Action;
