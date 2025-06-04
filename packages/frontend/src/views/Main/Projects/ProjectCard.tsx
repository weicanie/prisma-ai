import { AnimatedCircularProgressBar } from '@/components/magicui/animated-circular-progress-bar';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import { ArrowRight, CircleAlert } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ProjectCardProps {
	data: {
		info: {
			name: string; // 项目名称
		};
		createdAt?: string;
		updatedAt?: string;
		lookupResult: {
			score: number; //得分
			problem: { name: string; desc: string }[]; //存在的问题
			solution: { name: string; desc: string }[]; //解决方案
		};
	};
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ data }) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';
	const { updatedAt } = data;
	const { score, problem, solution } = data.lookupResult;
	const { name } = data.info;
	const [animatedScore, setAnimatedScore] = useState(0);

	useEffect(() => {
		const animationTimeout = setTimeout(() => {
			setAnimatedScore(score);
		}, 500);

		return () => clearTimeout(animationTimeout);
	}, [score]);
	// 根据分数确定进度条颜色
	let gaugePrimaryColor: string;
	if (score < 60) {
		gaugePrimaryColor = '#ef4444';
	} else if (score < 80) {
		gaugePrimaryColor = '#eab308';
	} else {
		gaugePrimaryColor = '#22c55e';
	}

	return (
		<Card
			className={`w-full  mx-auto transition-colors duration-200 ${
				isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
			} ${
				isDark
					? 'bg-gradient-to-r to-blue-900/50 from-purple-900/50 border-blue-700'
					: 'bg-gradient-to-r to-blue-50 from-purple-50 border-blue-200'
			}`}
		>
			{/* 卡片上部：显示得分 */}
			<CardHeader className="flex justify-center items-center text-center">
				<AnimatedCircularProgressBar
					max={100}
					min={0}
					value={animatedScore}
					gaugePrimaryColor={gaugePrimaryColor} // 进度条颜色
					gaugeSecondaryColor={isDark ? '#37415177' : '#d7dce577'} //进度条背景色
					className="size-32" // 进度条大小
				/>
			</CardHeader>

			{/* 卡片中部：显示项目名称、创建和更新时间 */}
			{/* <CardContent className="text-center">
				<CardTitle className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
					{name}
				</CardTitle>
				<CardDescription className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
					{updatedAt ? new Date(updatedAt).toLocaleDateString() : '未知时间'}
				</CardDescription>
			</CardContent> */}

			{/* 卡片下部：显示问题和解决方案列表 */}
			<CardFooter className="flex flex-col gap-4 pt-4">
				{/* 问题列表 */}
				{problem.length > 0 && (
					<div className="w-full">
						{/* <h3 className="text-center text-md font-semibold mb-3 text-red-600 dark:text-red-400">
							存在的问题
						</h3> */}
						<ul className="list-none space-y-2">
							{problem.slice(0, 3).map((item, index) => (
								<li key={`problem-${index}`} className="flex  text-sm gap-2">
									<CircleAlert className="text-red-600 dark:text-red-400 mt-0.5 size-4 flex-shrink-0" />
									<span className="text-red-600 dark:text-red-400 font-medium">{item.name}</span>
								</li>
							))}
							{problem.length > 3 && (
								<li className="text-sm text-gray-500 dark:text-gray-400 text-center">
									还有 {problem.length - 3} 个问题...
								</li>
							)}
						</ul>
					</div>
				)}

				{/* 解决方案列表 */}
				{solution.length > 0 && (
					<div className="w-full">
						{/* <h3 className="text-center text-md font-semibold mb-3 text-green-600 dark:text-green-400">
							解决方案
						</h3> */}
						<ul className="list-none space-y-2">
							{solution.slice(0, 3).map((item, index) => (
								<li key={`solution-${index}`} className="flex  text-sm gap-2">
									<ArrowRight className="text-green-600 dark:text-green-400 mt-0.5 size-4 flex-shrink-0" />
									<span className="text-green-600 dark:text-green-400 font-medium">
										{item.name}
									</span>
								</li>
							))}
							{solution.length > 3 && (
								<li className="text-sm text-gray-500 dark:text-gray-400 text-center">
									还有 {solution.length - 3} 个方案...
								</li>
							)}
						</ul>
					</div>
				)}
			</CardFooter>
		</Card>
	);
};
