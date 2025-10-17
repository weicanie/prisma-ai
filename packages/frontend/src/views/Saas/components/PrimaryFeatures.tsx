import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import backgroundImage from '@/assets/images/background-features.jpg';
import screenshot1 from '@/assets/images/screenshots/primary_features_1.webp';
import screenshot2 from '@/assets/images/screenshots/primary_features_2.webp';
import screenshot3 from '@/assets/images/screenshots/primary_features_3.webp';
import screenshot4 from '@/assets/images/screenshots/primary_features_4.webp';
import screenshot5 from '@/assets/images/screenshots/primary_features_5.webp';
import { Container } from './c-cpns/Container';

export function PrimaryFeatures() {
	const [tabOrientation, setTabOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

	const isOnline = import.meta.env.VITE_IS_ONLINE === 'true';

	useEffect(() => {
		const lgMediaQuery = window.matchMedia('(min-width: 1024px)');

		function onMediaQueryChange({ matches }: { matches: boolean }) {
			setTabOrientation(matches ? 'vertical' : 'horizontal');
		}

		onMediaQueryChange(lgMediaQuery);
		lgMediaQuery.addEventListener('change', onMediaQueryChange);

		return () => {
			lgMediaQuery.removeEventListener('change', onMediaQueryChange);
		};
	}, []);

	const features = [
		{
			title: '项目分析、优化、亮点挖掘，简历对岗定制',
			description:
				'不再堆名词，AI 深挖你的经历，产出能打动面试官的“团队贡献 + 技术亮点 + 业务价值”。针对目标 JD(Job Description)，自动改写简历重点与表述，命中筛选关键词。',
			image: screenshot1
		},
		...(isOnline
			? []
			: [
					{
						title: '人岗匹配',
						description: '实时抓岗位 + 本地向量匹配与重排，只推真正适合你的职位，不再盲投。',
						image: screenshot2
					}
				]),

		{
			title: '简历快速编辑：简历富文本编辑与pdf导出',
			description: '支持Markdown语法，一键导出可直接投递的简历pdf。',
			image: screenshot3
		},
		{
			title: 'AI助手：懂你和你的项目',
			description: '基于项目知识库和用户记忆，提供个性化服务。',
			image: screenshot4
		},
		...(isOnline
			? []
			: [
					{
						title: '高效准备面试：题库 + 思维导图 + Anki',
						description: '理解 + 记忆双引擎，准备更系统，八股不焦虑。',
						image: screenshot5
					}
				])
	];

	return (
		<section
			id="features"
			aria-label="Features for running your books"
			className="relative overflow-hidden bg-blue-600 pt-20 pb-28 sm:py-32"
		>
			<img
				className="absolute top-1/2 left-1/2 max-w-none translate-x-[-44%] translate-y-[-42%]"
				src={backgroundImage}
				alt=""
				width={2245}
				height={1636}
			/>
			<Container className="relative">
				<div className="max-w-2xl md:mx-auto md:text-center xl:max-w-none">
					<h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
						从简历到 offer
					</h2>
					<p className="mt-6 text-lg tracking-tight text-blue-100">
						解决求职核心痛点，闭环搞定求职关键路径。
					</p>
				</div>
				<TabGroup
					className="mt-16 grid grid-cols-1 items-center gap-y-2 pt-10 sm:gap-y-6 md:mt-20 lg:grid-cols-12 lg:pt-0"
					vertical={tabOrientation === 'vertical'}
				>
					{({ selectedIndex }) => (
						<>
							<div className="-mx-4 flex overflow-x-auto pb-4 sm:mx-0 sm:overflow-visible sm:pb-0 lg:col-span-5">
								<TabList className="relative z-10 flex gap-x-4 px-4 whitespace-nowrap sm:mx-auto sm:px-0 lg:mx-0 lg:block lg:gap-x-0 lg:gap-y-1 lg:whitespace-normal">
									{features.map((feature, featureIndex) => (
										<div
											key={feature.title}
											className={clsx(
												'group relative rounded-full px-4 py-1 lg:rounded-l-xl lg:rounded-r-none lg:p-6',
												selectedIndex === featureIndex
													? 'bg-white lg:bg-white/10 lg:ring-1 lg:ring-white/10 lg:ring-inset'
													: 'hover:bg-white/10 lg:hover:bg-white/5'
											)}
										>
											<h3>
												<Tab
													className={clsx(
														'font-display text-lg data-selected:not-data-focus:outline-hidden',
														selectedIndex === featureIndex
															? 'text-blue-600 lg:text-white'
															: 'text-blue-100 hover:text-white lg:text-white'
													)}
												>
													<span className="absolute inset-0 rounded-full lg:rounded-l-xl lg:rounded-r-none" />
													{feature.title}
												</Tab>
											</h3>
											<p
												className={clsx(
													'mt-2 hidden text-sm lg:block',
													selectedIndex === featureIndex
														? 'text-white'
														: 'text-blue-100 group-hover:text-white'
												)}
											>
												{feature.description}
											</p>
										</div>
									))}
								</TabList>
							</div>
							<TabPanels className="lg:col-span-7">
								{features.map(feature => (
									<TabPanel key={feature.title} unmount={false}>
										<div className="relative sm:px-6 lg:hidden">
											<div className="absolute -inset-x-4 -top-26 -bottom-17 bg-white/10 ring-1 ring-white/10 ring-inset sm:inset-x-0 sm:rounded-t-xl" />
											<p className="relative mx-auto max-w-2xl text-base text-white sm:text-center">
												{feature.description}
											</p>
										</div>
										<div className="mt-10 w-180 overflow-hidden rounded-xl bg-slate-50 shadow-xl shadow-blue-900/20 sm:w-auto lg:mt-0 lg:w-271.25">
											<img className="w-full" src={feature.image} alt="" />
										</div>
									</TabPanel>
								))}
							</TabPanels>
						</>
					)}
				</TabGroup>
			</Container>
		</section>
	);
}
