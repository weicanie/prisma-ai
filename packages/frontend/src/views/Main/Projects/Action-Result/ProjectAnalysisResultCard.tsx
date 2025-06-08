import { AnimatedCircularProgressBar } from '@/components/magicui/animated-circular-progress-bar';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { lookupResultDto, projectLookupedDto } from '@prism-ai/shared';
import { AlertTriangle, CheckCircle, Lightbulb, Pyramid } from 'lucide-react'; // Assuming lucide-react for icons
import React, { useEffect, useState } from 'react';
import type { ProjectResultProps } from './ProjectResult';

type ProjectAnalysisResultCardProps = Pick<
	ProjectResultProps,
	'resultData' | 'mergedData' | 'handleMerge'
> & {
	isDark: boolean;
};
/**
 * 项目分析结果展示组件
 * 用于展示AI对项目的拷打/分析结果，包括问题、解决方案和评分。
 */
export const ProjectAnalysisResultCard: React.FC<ProjectAnalysisResultCardProps> = ({
	resultData: result,
	isDark,
	mergedData,
	handleMerge
}) => {
	result = result as lookupResultDto | null;

	const score = result?.score;
	const [animatedScore, setAnimatedScore] = useState(0);

	useEffect(() => {
		const animationTimeout = setTimeout(() => {
			if (score) {
				setAnimatedScore(score);
			}
		}, 500);

		return () => clearTimeout(animationTimeout);
	}, [score]);

	if (!result) return;
	// 根据分数确定进度条颜色
	let gaugePrimaryColor: string;
	if (score! < 60) {
		gaugePrimaryColor = '#ef4444';
	} else if (score! < 80) {
		gaugePrimaryColor = '#eab308';
	} else {
		gaugePrimaryColor = '#22c55e';
	}
	mergedData = mergedData as projectLookupedDto | null;

	return (
		<>
			<CardHeader>
				<CardTitle
					className={`flex items-center justify-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
				>
					<Lightbulb className="w-5 h-5 text-yellow-500" />
					Prisma 深度分析结果
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* 评分 */}
				<div className="flex flex-col items-center">
					{/* <h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
						综合评分
					</h4> */}
					{/* <Badge
						variant={
							result.score >= 80 ? 'default' : result.score >= 60 ? 'secondary' : 'destructive'
						}
						className="text-lg px-3 py-1"
					>
						{result.score} / 100
					</Badge> */}
					<AnimatedCircularProgressBar
						max={100}
						min={0}
						value={animatedScore}
						gaugePrimaryColor={gaugePrimaryColor} // 进度条颜色
						gaugeSecondaryColor={isDark ? '#37415177' : '#d7dce577'} //进度条背景色
						className="size-32" // 进度条大小
					/>
				</div>

				{/* 存在的问题 */}
				{result.problem && result.problem.length > 0 && (
					<div>
						<h4
							className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}
						>
							<AlertTriangle className="w-4 h-4" />
							存在的问题
						</h4>
						<ul className="space-y-3">
							{result.problem.map((p, index) => (
								<li
									key={`problem-${index}`}
									className={`p-3 rounded-lg ${isDark ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'}`}
								>
									<p className={`font-medium ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
										{p.name}
									</p>
									<p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
										{p.desc}
									</p>
								</li>
							))}
						</ul>
					</div>
				)}

				{/* 解决方案建议 */}
				{result.solution && result.solution.length > 0 && (
					<div>
						<h4
							className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}
						>
							<CheckCircle className="w-4 h-4" />
							解决方案
						</h4>
						<ul className="space-y-3">
							{result.solution.map((s, index) => (
								<li
									key={`solution-${index}`}
									className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}
								>
									<p className={`font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>
										{s.name}
									</p>
									<p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
										{s.desc}
									</p>
								</li>
							))}
						</ul>
					</div>
				)}
			</CardContent>
			{mergedData && (
				<div className="flex justify-center">
					<Button
						onClick={handleMerge}
						variant="default"
						className="fixed  bottom-5 right-40   rounded-md  w-80 hover:bg-purple-700 text-white"
						size="lg"
					>
						<Pyramid className="w-4 h-4 mr-2" />
						完成分析
					</Button>
				</div>
			)}
		</>
	);
};
