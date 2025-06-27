import { useTheme } from '@/utils/theme';
import {
	type ImplementDto,
	jsonMd_obj,
	type lookupResultDto,
	type ProjectDto,
	type projectLookupedDto,
	type ProjectMinedDto,
	ProjectStatus
} from '@prism-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { ProjectQueryKey } from '../../../query/keys';
import { findAllProjects, implementProject } from '../../../services/project';
import type { contextInput } from '../../../services/sse/sse';
import { useSseAnswer } from '../../../services/sse/useSseAnswer';
import { OriginalProject } from './Action-Result/OriginalProject';
import { ProjectResult } from './Action-Result/ProjectResult';
//TODO 将调用llm、获取sse返回过程封装成一个统一的组件
interface ActionProps {
	_?: string;
}

const Action: React.FC<ActionProps> = () => {
	const { projectId } = useParams();
	const { data, status } = useCustomQuery([ProjectQueryKey.Projects], findAllProjects);
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	const navigate = useNavigate();

	const [input, setInput] = useState<contextInput | object>({});
	//目标接口的URL path
	const [urlPath, setUrlPath] = useState('');
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
	const { content, reasonContent, done, isReasoning } = useSseAnswer(input, urlPath);
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
				console.log('🚀 ~ sse最终结果:', result);

				setResultData(resultData);
				if (mergedData) {
					setMergedData(mergedData); //[结果]支持
				}
			} else {
				setResultData(result);
			}

			setInput({}); // 清空输入防止sse重复请求
			//setState异步, 需要等待setState执行完再执行navigate
			setTimeout(() => {
				navigate('#result');
			}, 0);
		}
	}, [done]);

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
	const actionType: 'lookup' | 'polish' | 'mine' | 'collaborate' | null = availableActions[0] as
		| 'lookup'
		| 'polish'
		| 'mine'
		| 'collaborate'
		| null;

	// 处理AI分析
	const handleLookup = () => {
		const projectDto: ProjectDto = {
			info: projectData.info,
			lightspot: projectData.lightspot
		};
		setInput({ input: projectDto });
		setUrlPath('/project/lookup');
		navigate('#reasoning');
	};

	// 处理AI打磨
	const handlePolish = () => {
		const projectLookupedDto: projectLookupedDto = {
			info: projectData.info,
			lightspot: projectData.lightspot,
			lookupResult: projectData.lookupResult!
		};
		setInput({ input: projectLookupedDto });
		setUrlPath('/project/polish');
		navigate('#reasoning');
	};

	// 处理AI挖掘
	const handleMine = () => {
		const projectDto: ProjectDto = {
			info: projectData.info,
			lightspot: projectData.lightspot
		};
		setInput({ input: projectDto });
		setUrlPath('/project/mine');
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
	};

	/* 用户点击完成优化后更新左侧的项目经验,并更新所有状态 */
	const handleMerge = () => {
		queryClient.invalidateQueries({ queryKey: [ProjectQueryKey.Projects] });
		setInput({});
		setUrlPath('polish');
		navigate('#next-action');
	};

	/**
	 * 用户提交反馈后重新调用llm
	 * @param content 反馈内容
	 */
	const handleFeedback = (content: string) => {
		switch (actionType) {
			case 'lookup':
				setInput({
					input: projectData,
					userFeedback: {
						reflect: true,
						content
					}
				});
				break;
			case 'polish': {
				const projectLookupedDto: projectLookupedDto = {
					info: projectData.info,
					lightspot: projectData.lightspot,
					lookupResult: projectData.lookupResult!
				};
				setInput({
					input: projectLookupedDto,
					userFeedback: {
						reflect: true,
						content
					}
				});
				break;
			}
			case 'mine':
				setInput({
					input: projectData,
					userFeedback: {
						reflect: true,
						content
					}
				});
				break;
			default:
				break;
		}
		setUrlPath(urlPath);
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
				{/* <PageHeader title="项目经验优化" description="让 Prisma 深度优化您的项目经验"></PageHeader> */}

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
