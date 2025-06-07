import { Pyramid } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const tabs = [
	{ name: 'My Account', href: '#', icon: Pyramid, current: false },
	{ name: 'Company', href: '#', icon: Pyramid, current: false },
	{ name: 'Team Members', href: '#', icon: Pyramid, current: true },
	{ name: 'Billing', href: '#', icon: Pyramid, current: false }
];

interface Tab {
	name: string;
	href: string;
	icon: React.ElementType;
	current: boolean;
}
function classNames(...classes: (string | boolean)[]) {
	return classes.filter(Boolean).join(' ');
}

export default function Tabs() {
	const [currentTab, setCurrentTab] = useState<Tab>(tabs[0]);
	const navigate = useNavigate();
	tabs.forEach(t => {
		t.current = t.name === currentTab.name; //更新当前选中状态
	});
	//添加点击选中功能
	const handleClick = (tab: Tab) => {
		console.log('🚀 ~ handleClick ~ tab:', tab);
		navigate(tab.href);
		tabs.forEach(t => {
			t.current = t.name === tab.name; //更新当前选中状态
		});
		setCurrentTab(tab);
	};
	return (
		<div>
			{/* 在小屏幕如手机上显示select group */}
			<div className="grid grid-cols-1 sm:hidden">
				{/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
				<select
					defaultValue={tabs.find(tab => tab.current)?.name}
					aria-label="Select a tab"
					className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
				>
					{tabs.map(tab => (
						<option key={tab.name} onClick={() => handleClick(tab)}>
							{tab.name}
						</option>
					))}
				</select>
				<Pyramid
					aria-hidden="true"
					className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500"
				/>
			</div>
			{/* 在大屏幕如电脑上显示tab group */}
			<div className="hidden sm:block">
				<div className="border-b border-gray-200">
					<nav aria-label="Tabs" className="-mb-px flex space-x-8">
						{tabs.map(tab => (
							<a
								key={tab.name}
								href={tab.href}
								aria-current={tab.current ? 'page' : undefined}
								className={classNames(
									tab.current
										? 'border-indigo-500 text-indigo-600'
										: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
									'group inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium'
								)}
							>
								<tab.icon
									aria-hidden="true"
									className={classNames(
										tab.current ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
										'-ml-0.5 mr-2 size-5'
									)}
								/>
								<span>{tab.name}</span>
							</a>
						))}
					</nav>
				</div>
			</div>
		</div>
	);
}
