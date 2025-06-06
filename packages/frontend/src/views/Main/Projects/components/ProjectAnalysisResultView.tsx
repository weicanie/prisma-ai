import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { lookupResultSchema } from '@prism-ai/shared';
import { AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react'; // Assuming lucide-react for icons
import React from 'react';
import { z } from 'zod';

interface ProjectAnalysisResultViewProps {
	result: z.infer<typeof lookupResultSchema>;
	isDark: boolean;
}

/**
 * 项目分析结果展示组件
 * 用于展示AI对项目的拷打/分析结果，包括问题、解决方案和评分。
 */
export const ProjectAnalysisResultView: React.FC<ProjectAnalysisResultViewProps> = ({
	result,
	isDark
}) => {
	return (
		<Card className={` ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
			<CardHeader>
				<CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
					<Lightbulb className="w-5 h-5 text-yellow-500" />
					AI 分析结果
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* 评分 */}
				<div>
					<h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
						综合评分
					</h4>
					<Badge
						variant={
							result.score >= 80 ? 'default' : result.score >= 60 ? 'secondary' : 'destructive'
						}
						className="text-lg px-3 py-1"
					>
						{result.score} / 100
					</Badge>
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
							改进建议
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
		</Card>
	);
};
