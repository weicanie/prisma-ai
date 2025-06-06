import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSseAnswer } from '@/services/sse/useSseAnswer';
import { useTheme } from '@/utils/theme';
import { jsonMd_obj, lookupResultSchema, type ProjectDto } from '@prism-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import { Wand2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { useCustomQuery } from '../../../query/config';
import { ProjectQueryKey } from '../../../query/keys';
import { findAllProjects } from '../../../services/project';
import { ProjectAnalysisResultView } from './components/ProjectAnalysisResultView';
import { ProjectDetailActions } from './components/ProjectDetailActions';
import { StreamingDisplayCard } from './components/StreamingDisplayCard';
import { OriginalProject } from './Result/OriginalProject';

interface ReadProps {}

/**
 * 项目经验详情页面
 *
 * 页面布局：
 * - 左侧：项目原始信息展示 (ProjectInfoDisplay)
 * - 右侧：
 *    - 初始状态：显示 "使用AI分析项目" 按钮。
 *    - 点击分析后：
 *        1. 显示思维链 (StreamingContentDisplay for reasonContent)
 *        2. 显示AI生成的分析内容 (StreamingContentDisplay for content)
 *        3. 显示格式化的分析结果卡片 (ProjectAnalysisResultView)
 *        4. 在分析结果卡片下方，显示原有的两个操作按钮（“AI打磨”、“AI挖掘”），通过 ProjectDetailActions 组件渲染。
 */
export const Read: React.FC<ReadProps> = ({}) => {
	const { projectIndex } = useParams<{ projectIndex: string }>();
	const { data, status } = useCustomQuery([ProjectQueryKey.Projects], findAllProjects);

	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	// AI分析相关状态
	const [input, setInput] = useState<ProjectDto | {}>({});
	// target 固定为 'lookup'，因为此页面只做分析不做打磨或挖掘
	const [target, setTarget] = useState<'lookup'>('lookup');
	const [analysisResult, setAnalysisResult] = useState<z.infer<typeof lookupResultSchema> | null>(
		null
	);
	const [showAnalysisButton, setShowAnalysisButton] = useState(true); // 控制AI分析按钮的显示

	// 从SSE获取AI分析结果
	const { content, reasonContent, done, isReasoning, error, errorCode, errorMsg } = useSseAnswer(
		input,
		target
	);

	const queryClient = useQueryClient();
	// 当SSE完成时，解析content为分析结果
	useEffect(() => {
		if (done && content) {
			const parsedResult = jsonMd_obj(content);
			setAnalysisResult(parsedResult);
			queryClient.invalidateQueries({ queryKey: [ProjectQueryKey.Projects] });
		}
	}, [done, content]);

	// 处理错误状态
	useEffect(() => {
		if (error) {
			console.error(`AI分析错误 (编码: ${errorCode}): ${errorMsg}`);
			// 可以在UI上显示更友好的错误提示
			setAnalysisResult({
				problem: [
					{
						name: 'AI分析出错',
						desc: `分析过程中发生错误: ${errorMsg || '未知错误'} (代码: ${errorCode || 'N/A'})`
					}
				],
				solution: [],
				score: 0
			});
		}
	}, [error, errorCode, errorMsg]);

	if (status === 'pending') {
		return <div className="flex justify-center items-center min-h-screen">加载中...</div>;
	}
	if (status === 'error' || !data?.data) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				错误：无法加载项目数据。{data?.message}
			</div>
		);
	}

	const projectDatas = data.data;
	const projectData = projectDatas?.[+projectIndex!];

	if (!projectData || projectIndex === undefined) {
		return <div className="text-center text-gray-500 py-10">没有找到指定的项目经验数据。</div>;
	}

	// 点击 "使用AI分析项目" 按钮的处理器
	const handleStartAnalysis = () => {
		const projectDto: ProjectDto = {
			info: projectData.info,
			lightspot: projectData.lightspot
		};
		setInput(projectDto);
		setTarget('lookup'); // 确保target是lookup
		setShowAnalysisButton(false); // 隐藏按钮，开始显示SSE内容
		setAnalysisResult(null); // 清空旧的分析结果
	};

	return (
		<div
			className={`py-8 min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}
		>
			<div className="container mx-auto px-4 pb-8">
				{/* <PageHeader title="项目经验详情与分析" description="查看您的项目经验，并使用AI进行深度分析" /> */}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
					{/* 左侧：项目原始信息 */}
					<div className="overflow-y-auto scb-thin">
						<OriginalProject
							projectData={projectData}
							projectIndex={projectIndex}
							isDark={isDark}
						/>
					</div>

					{/* 右侧：AI分析区域 */}
					<div className=" h-full overflow-y-auto scb-thin">
						{/* 分析按钮卡片 */}
						{showAnalysisButton && !isReasoning && !content && !analysisResult && (
							<Card
								className={`flex flex-col items-center justify-center text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
							>
								<Wand2 className={`w-12 h-12 mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
								<h3
									className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
								>
									项目深度分析
								</h3>
								<p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									让 Prisma 帮助您分析项目的潜在问题和改进方向。
								</p>
								<Button
									onClick={handleStartAnalysis}
									size="lg"
									className={`${isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
								>
									<Wand2 className="mr-2 h-5 w-5" /> 使用 Prisma 分析项目
								</Button>
							</Card>
						)}

						{/* 思维链内容展示卡片 */}
						{isReasoning && reasonContent && !done && (
							<StreamingDisplayCard
								title="Prisma 分析项目中..."
								currentContent={reasonContent}
								isDark={isDark}
								isStreamingDone={done}
							/>
						)}

						{/* AI生成内容流式展示卡片 (在done之前，且非reasoning阶段) */}
						{!isReasoning && content && !done && (
							<StreamingDisplayCard
								title="Prisma 正在生成分析报告..."
								currentContent={content}
								isDark={isDark}
								isStreamingDone={done}
							/>
						)}

						{/* 分析结果卡片 */}
						{analysisResult && done && (
							<>
								<ProjectAnalysisResultView result={analysisResult} isDark={isDark} />
								{/* 在分析结果下方展示后续操作按钮 */}
								{projectIndex !== undefined && (
									<ProjectDetailActions
										projectData={projectData}
										projectIndex={projectIndex}
										isDark={isDark}
									/>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
export default Read;
