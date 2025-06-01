import { AnimatedCircularProgressBar } from '@/components/magicui/animated-circular-progress-bar'; // 导入动画圆形进度条组件
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card'; // 从@/components/ui/card导入卡片组件
import { ArrowRight, CircleAlert } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ProjectCardProps {
	data: {
		info: {
			name: string; // 项目名称
		};
		createdAt?: string; //创建时间
		updatedAt?: string; //更新时间
		lookupResult: {
			score: number; //得分
			problem: { name: string; desc: string }[]; //存在的问题
			solution: { name: string; desc: string }[]; //解决方案
		};
	};
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ data }) => {
	const { createdAt, updatedAt } = data;
	const { score, problem, solution } = data.lookupResult;
	const { name } = data.info;
	const [animatedScore, setAnimatedScore] = useState(0);

	useEffect(() => {
		const animationTimeout = setTimeout(() => {
			setAnimatedScore(score);
		}, 500); // 延迟500ms开始动画，可以根据需要调整

		return () => clearTimeout(animationTimeout);
	}, [score]);

	// 根据分数确定进度条颜色
	let gaugePrimaryColor: string;
	if (score < 60) {
		gaugePrimaryColor = 'red'; // 低于60分显示红色
	} else if (score < 80) {
		gaugePrimaryColor = 'yellow'; // 60-80分显示黄色
	} else {
		gaugePrimaryColor = 'green'; // 80-100分显示绿色
	}
	return (
		<Card className="w-md bg-zinc-800">
			{/* 卡片上部：显示得分 */}
			<CardHeader className="flex justify-center items-center text-center">
				<AnimatedCircularProgressBar
					max={100}
					min={0}
					value={animatedScore} // 使用动画状态的分数
					gaugePrimaryColor={gaugePrimaryColor}
					gaugeSecondaryColor="transparent" // 设置进度条背景色
					className="size-32" // 调整进度条大小
				/>
			</CardHeader>

			{/* 卡片中部：显示项目名称、创建和更新时间 */}
			<CardContent className="text-center">
				<CardTitle className="text-xl font-bold">{name}</CardTitle>
				<CardDescription className="text-sm text-gray-500">
					{new Date(updatedAt!).toLocaleDateString()}
				</CardDescription>
			</CardContent>

			{/* 卡片下部：显示问题和解决方案列表 */}
			<CardFooter className="flex flex-col gap-4 pt-4">
				{/* 问题列表 */}
				<div className="w-full">
					<h3 className="text-center text-md font-semibold mb-2 text-red-700">存在的问题</h3>
					<ul className="list-none space-y-1 pl-[35%]">
						{problem.map((item, index) => (
							<li
								key={`problem-${index}`}
								className="flex justify-start items-center text-sm space-x-3"
							>
								<CircleAlert className="text-red-700 ml-2 size-4" />
								<span className="text-red-700 font-semibold">{item.name}</span>
								{/* <span>{item.desc}</span> */}
							</li>
						))}
					</ul>
				</div>

				{/* 解决方案列表 */}
				<div className="w-full">
					<h3 className="text-center text-md font-semibold mb-2 text-green-700">解决方案</h3>
					<ul className="list-none  space-y-1  pl-[35%]">
						{solution.map((item, index) => (
							<li
								key={`solution-${index}`}
								className="flex justify-start items-center text-sm space-x-3"
							>
								<ArrowRight className="text-green-700 ml-2 size-4" />
								<span className="text-green-700 font-semibold">{item.name}</span>
								{/* <span>{item.desc}</span> */}
							</li>
						))}
					</ul>
				</div>
			</CardFooter>
		</Card>
	);
};
