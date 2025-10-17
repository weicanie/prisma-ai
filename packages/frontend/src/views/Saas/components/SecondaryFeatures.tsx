import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import clsx from 'clsx';
import { useId } from 'react';

import screenshot1 from '@/assets/images/screenshots/secondary_features_1.webp';
import screenshot2 from '@/assets/images/screenshots/secondary_features_2.webp';
import screenshot3 from '@/assets/images/screenshots/secondary_features_3.webp';
import { Container } from './c-cpns/Container';
import { SwirlyDoodle } from './Pricing';

interface Feature {
	name: React.ReactNode;
	summary: string;
	description: string;
	image: string;
	icon: React.ComponentType;
}

const features: Array<Feature> = [
	{
		name: '上传资料，搭建项目知识库，自动生成用户记忆',
		summary: '上传项目经历、项目文档、项目代码等信息，AI会自动搭建知识库并生成用户记忆',
		description: '真实经历直连 AI，让 AI 懂你和你的项目',
		image: screenshot1,
		icon: function ReportingIcon() {
			return (
				<>
					{' '}
					<path
						opacity=".5"
						d="M25.778 25.778c.39.39 1.027.393 1.384-.028A11.952 11.952 0 0 0 30 18c0-6.627-5.373-12-12-12S6 11.373 6 18c0 2.954 1.067 5.659 2.838 7.75.357.421.993.419 1.384.028.39-.39.386-1.02.036-1.448A9.959 9.959 0 0 1 8 18c0-5.523 4.477-10 10-10s10 4.477 10 10a9.959 9.959 0 0 1-2.258 6.33c-.35.427-.354 1.058.036 1.448Z"
						fill="#fff"
					/>
					<path
						d="M12 28.395V28a6 6 0 0 1 12 0v.395A11.945 11.945 0 0 1 18 30c-2.186 0-4.235-.584-6-1.605ZM21 16.5c0-1.933-.5-3.5-3-3.5s-3 1.567-3 3.5 1.343 3.5 3 3.5 3-1.567 3-3.5Z"
						fill="#fff"
					/>
				</>
			);
		}
	},
	{
		name: 'AI 优化与对岗定制',
		summary: '自动分析问题并解决，深度优化、挖掘亮点，对着 JD 改到位',
		description: '不满意还能直接反馈，AI 立马调整到位',
		image: screenshot2,
		icon: function InventoryIcon() {
			return (
				<>
					<path
						opacity=".5"
						d="M8 17a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2Z"
						fill="#fff"
					/>
					<path
						opacity=".3"
						d="M8 24a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2Z"
						fill="#fff"
					/>
					<path
						d="M8 10a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2Z"
						fill="#fff"
					/>
				</>
			);
		}
	},
	{
		name: '简历编辑与导出',
		summary: '点几个按钮，高颜值简历就直接给你准备好，投递就绪',
		description: '支持在线编辑，导出 PDF 格式，内置美观模板一键应用',
		image: screenshot3,
		icon: function ContactsIcon() {
			const id = useId();
			return (
				<>
					<defs>
						<linearGradient
							id={id}
							x1="11.5"
							y1={18}
							x2={36}
							y2="15.5"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset=".194" stopColor="#fff" />
							<stop offset={1} stopColor="#6692F1" />
						</linearGradient>
					</defs>
					<path
						d="m30 15-4 5-4-11-4 18-4-11-4 7-4-5"
						stroke={`url(#${id})`}
						strokeWidth={2}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</>
			);
		}
	}
];

function Feature({
	feature,
	isActive,
	className,
	...props
}: React.ComponentPropsWithoutRef<'div'> & {
	feature: Feature;
	isActive: boolean;
}) {
	return (
		<div className={clsx(className, !isActive && 'opacity-75 hover:opacity-100')} {...props}>
			<div className={clsx('w-9 rounded-lg', isActive ? 'bg-blue-600' : 'bg-slate-500')}>
				<svg aria-hidden="true" className="h-9 w-9" fill="none">
					<feature.icon />
				</svg>
			</div>
			<h3
				className={clsx('mt-6 text-sm font-medium', isActive ? 'text-blue-600' : 'text-slate-600')}
			>
				{feature.name}
			</h3>
			<p className="mt-2 font-display text-xl text-slate-900">{feature.summary}</p>
			<p className="mt-4 text-sm text-slate-600">{feature.description}</p>
		</div>
	);
}

function FeaturesMobile() {
	return (
		<div className="-mx-4 mt-20 flex flex-col gap-y-10 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:hidden">
			{features.map(feature => (
				<div key={feature.summary}>
					<Feature feature={feature} className="mx-auto max-w-2xl" isActive />
					<div className="relative mt-10 pb-10">
						<div className="absolute -inset-x-4 top-8 bottom-0 bg-slate-200 sm:-inset-x-6" />
						<div className="relative mx-auto w-211 overflow-hidden rounded-xl bg-white shadow-lg ring-1 shadow-slate-900/5 ring-slate-500/10">
							<img className="w-full" src={feature.image} alt="" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

function FeaturesDesktop() {
	return (
		<TabGroup className="hidden lg:mt-20 lg:block">
			{({ selectedIndex }) => (
				<>
					<TabList className="grid grid-cols-3 gap-x-8">
						{features.map((feature, featureIndex) => (
							<Feature
								key={feature.summary}
								feature={{
									...feature,
									name: (
										<Tab className="data-selected:not-data-focus:outline-hidden">
											<span className="absolute inset-0" />
											{feature.name}
										</Tab>
									)
								}}
								isActive={featureIndex === selectedIndex}
								className="relative"
							/>
						))}
					</TabList>
					<TabPanels className="relative mt-20 overflow-hidden rounded-4xl bg-slate-200 px-14 py-16 xl:px-16">
						<div className="-mx-5 flex">
							{features.map((feature, featureIndex) => (
								<TabPanel
									static
									key={feature.summary}
									className={clsx(
										'px-5 transition duration-500 ease-in-out data-selected:not-data-focus:outline-hidden',
										featureIndex !== selectedIndex && 'opacity-60'
									)}
									style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
									aria-hidden={featureIndex !== selectedIndex}
								>
									<div className="w-211 overflow-hidden rounded-xl bg-white shadow-lg ring-1 shadow-slate-900/5 ring-slate-500/10">
										<img className="w-full" src={feature.image} alt="" />
									</div>
								</TabPanel>
							))}
						</div>
						<div className="pointer-events-none absolute inset-0 rounded-4xl ring-1 ring-slate-900/10 ring-inset" />
					</TabPanels>
				</>
			)}
		</TabGroup>
	);
}

export function SecondaryFeatures() {
	return (
		<section
			id="secondary-features"
			aria-label="Features for simplifying everyday business tasks"
			className="pt-20 pb-14 sm:pt-32 sm:pb-20 lg:pb-32"
		>
			<Container>
				<div className="mx-auto max-w-2xl md:text-center">
					<h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
						简单三步，从
						<span className="relative whitespace-nowrap">
							<SwirlyDoodle className="absolute top-1/2 left-0 h-[1em] w-full fill-blue-400" />
							<span className="relative">简历到 offer</span>
						</span>
					</h2>
					<p className="mt-4 text-lg tracking-tight text-slate-700">
						通过我们的智能化流程，让求职变得更加高效和系统。
					</p>
				</div>
				<FeaturesMobile />
				<FeaturesDesktop />
			</Container>
		</section>
	);
}
