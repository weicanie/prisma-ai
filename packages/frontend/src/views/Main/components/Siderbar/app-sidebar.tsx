'use client';

import {
	FileText,
	House,
	LibraryBig,
	ListChecks,
	Pyramid,
	Rocket,
	Sparkles,
	Target
} from 'lucide-react';
import * as React from 'react';

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	useSidebar
} from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { TeamSwitcher } from './team-switcher';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const navigate = useNavigate();
	const userInfoData = localStorage.getItem('userInfo');
	const userInfo = JSON.parse(userInfoData || '{}')?.data;
	//流程、分组
	const data = {
		user: {
			name: userInfo?.username || '示例用户',
			email: userInfo?.email || 'user@example.com',
			avatar: userInfo?.avatar || '/avatars/shadcn.jpg'
		},
		teams: [
			{
				name: '简历灵感菇',
				logo: Pyramid,
				plan: '从简历到offer'
			}
		],
		navMain: [
			{
				title: '首页',
				url: '/main/home',
				icon: House
			},
			{
				title: '职业技能',
				url: '/main/skills',
				isOpen: true,
				icon: ListChecks
			},
			{
				title: '项目经验',
				url: '/main/projects',
				icon: Sparkles,
				isOpen: true
			},
			{
				title: '简历',
				icon: FileText,
				url: '/main/resumes'
			},
			{
				title: '岗位',
				icon: Target,
				url: '/main/job'
				// items: [
				// 	{ title: '简历匹配', url: '/main/job/match' },
				// 	{ title: '我的岗位专用简历', url: '/main/job/list' }
				// ]
			},
			{
				title: '知识库',
				icon: LibraryBig,
				url: '/main/knowledge'
			},
			{
				title: '面向offer学习',
				icon: Rocket,
				url: '/main/offer',
				items: [
					{ title: '技术学习路线', url: '/main/offer/road' },
					{ title: '项目亮点实现', url: '/main/offer/doit' },
					{ title: '简历延申八股', url: '/main/offer/questions' },
					{ title: '模拟面试', url: '/main/offer/mock-interview' }
				]
			}
		]
	};
	// const { state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar } = useSidebar();
	const { isMobile, toggleSidebar } = useSidebar();
	const [selectedGroupIndex, setSelectedGroupIndex] = React.useState(0);
	const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);

	//挂载时，从当前URL确定selectedGroupIndex、selectedItemIndex
	React.useEffect(() => {
		const currentPath = window.location.pathname;
		let found = false;
		data.navMain.forEach((group, groupIdx) => {
			if (group.items) {
				group.items.forEach((item, itemIdx) => {
					if (item.url === currentPath) {
						setSelectedGroupIndex(groupIdx);
						setSelectedItemIndex(itemIdx);
						found = true;
						return;
					}
				});
			} else if (group.url === currentPath) {
				setSelectedGroupIndex(groupIdx);
				setSelectedItemIndex(-1); // 没有子项，直接选中主项
				found = true;
				return;
			}
		});

		//如果当前URL没有匹配到任何项，则默认打开则打开第一组
		if (!found) {
			const g = data.navMain[0];
			if (g) {
				if (g.items && g.items.length > 0) {
					setSelectedGroupIndex(0);
					setSelectedItemIndex(0);
				} else {
					setSelectedGroupIndex(0);
					setSelectedItemIndex(-1);
				}
			}
		}
	}, []);

	const handleNavItemClick = (groupIndex: number, itemIndex: number, url: string) => {
		setSelectedGroupIndex(groupIndex);
		setSelectedItemIndex(itemIndex);
		navigate(url);
		//如果是移动端，点击后关闭侧边栏
		if (isMobile) {
			toggleSidebar();
		}
	};

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain
					items={data.navMain}
					selectedGroupIndex={selectedGroupIndex}
					selectedItemIndex={selectedItemIndex}
					onItemClick={handleNavItemClick}
				/>
				{/* NavProjects component removed */}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
