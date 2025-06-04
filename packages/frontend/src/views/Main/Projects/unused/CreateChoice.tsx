import { ArrowUpFromLine, PlusIcon } from 'lucide-react';
import React from 'react';
import { Outlet, useOutlet } from 'react-router-dom';
import { ChoiceCard } from './ChoiceCard';

interface CreateChoiceProps {}

export const CreateChoice: React.FC<CreateChoiceProps> = props => {
	const createCard = {
		Icon: (
			<PlusIcon size={100} strokeWidth={2} color="rgb(0,137,255)" className="w-full"></PlusIcon>
		),
		title: '创建一个新的项目经验',
		description: '我们会帮助你一步步创建一个新的项目经验',
		href: '/main/projects/new/create',
		className: 'lg:row-start-1 lg:row-end-3 lg:col-start-1 lg:col-end-3'
	};

	const uploadCard = {
		Icon: (
			<ArrowUpFromLine
				size={100}
				strokeWidth={2}
				color="rgb(0,137,255)"
				className="w-full"
			></ArrowUpFromLine>
		),
		title: '我已经有一个项目经验了',
		description: '我们将会转换你的项目经验的格式',
		href: '/main/projects/new/upload',
		className: 'lg:row-start-1 lg:row-end-3 lg:col-start-3 lg:col-end-5'
	};
	const outletElement = useOutlet();
	return (
		<div className="bg-global">
			{!outletElement && (
				<>
					<div className="flex items-center justify-center w-full position-relative pt-10">
						<h1 className="text-4xl font-bold">你想怎么</h1>
						<h1 className="text-4xl font-bold text-blue-500">创建你的项目经验?</h1>
					</div>
					<div className="grid lg:grid-rows-4 lg:grid-cols-4 w-full h-full p-10 lg:p-25 gap-10">
						<ChoiceCard
							title={createCard.title}
							description={createCard.description}
							className={createCard.className}
							href={createCard.href}
							icon={createCard.Icon}
						></ChoiceCard>
						<ChoiceCard
							title={uploadCard.title}
							description={uploadCard.description}
							className={uploadCard.className}
							href={uploadCard.href}
							icon={uploadCard.Icon}
						></ChoiceCard>
					</div>
				</>
			)}

			<Outlet />
		</div>
	);
};
