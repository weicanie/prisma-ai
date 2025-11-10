import {
	Book,
	Bot,
	Brain,
	FileText,
	LayoutList,
	LibraryBig,
	MonitorCog,
	SlidersHorizontal,
	Sparkles,
	SquarePen,
	Target,
	type LucideIcon
} from 'lucide-react';
import * as React from 'react';

import { Logo } from '@/components/Logo';
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
	const userInfo = userInfoData && JSON.parse(userInfoData);
	const isOnline = import.meta.env.VITE_IS_ONLINE === 'true';

	//流程、分组
	const data: {
		navMain: {
			title: string;
			icon: LucideIcon;
			url: string;
			groupLabel?: string;
			items?: {
				title: string;
				icon: LucideIcon;
				url: string;
			}[];
		}[];
		user: {
			name: string;
			email: string;
			avatar: string;
		};
		teams: {
			name: string;
			logo: LucideIcon;
			plan: string;
		}[];
	} = {
		user: {
			name: userInfo?.username || '示例用户',
			email: userInfo?.email || 'user@example.com',
			avatar: userInfo?.avatar || '/avatars/shadcn.jpg'
		},
		teams: [
			{
				name: '',
				logo: Logo,
				plan: '从简历到offer'
			}
		],
		navMain: [
			{
				title: '知识库',
				icon: LibraryBig,
				url: '/main/knowledge',
				groupLabel: '知识库'
			},
			{
				title: '用户记忆',
				icon: Brain,
				url: '/main/user-memory'
			},
			{
				title: '项目优化',
				icon: Sparkles,
				url: '/main/projects',
				groupLabel: '简历优化'
			},
			{
				title: 'Prisma',
				icon: Bot,
				url: '/main/aichat'
			},
			...(isOnline
				? []
				: [
						{
							title: '匹配岗位',
							icon: Target,
							url: '/main/hjm/job',
							groupLabel: '人岗匹配'
						}
					]),
			{
				title: '定制简历',
				icon: FileText,
				url: '/main/hjm/resume'
			},
			{
				title: '简历组装、导出',
				icon: LayoutList,
				url: '/main/resumes',
				groupLabel: '简历编辑'
			},
			{
				title: '简历编辑器',
				icon: SquarePen,
				url: '/main/resume-editor'
			},
			...(isOnline
				? []
				: [
						{
							title: '题库和 anki',
							icon: Book,
							url: '/main/offer/anki',
							groupLabel: '面向offer学习'
						}
					]),

			{
				title: '用户配置',
				icon: SlidersHorizontal,
				url: '/main/user-config',
				groupLabel: '用户配置'
			},
			...(userInfo?.role === 'admin'
				? [
						{
							title: '管理后台',
							icon: MonitorCog,
							url: '/main/manage',
							groupLabel: '管理员',
							items: [
								{
									title: '用户管理',
									icon: MonitorCog,
									url: '/main/manage/user'
								},
								{
									title: '服务管理',
									icon: MonitorCog,
									url: '/main/manage/service'
								},
								{
									title: '通知管理',
									icon: MonitorCog,
									url: '/main/manage/notification'
								}
							]
						}
					]
				: [])
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
			<SidebarContent className="scb-thin">
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
