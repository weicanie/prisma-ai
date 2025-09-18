import {
	Book,
	Briefcase,
	CircleDollarSign,
	FileText,
	GraduationCap,
	LayoutList,
	LibraryBig,
	ListChecks,
	Pyramid,
	Sparkles,
	SquarePen,
	Target,
	type LucideIcon
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
	const userInfo = userInfoData && JSON.parse(userInfoData);
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
				name: 'Prisma',
				logo: Pyramid,
				plan: '从简历到offer'
			}
		],
		navMain: [
			{
				title: '项目知识库',
				icon: LibraryBig,
				url: '/main/knowledge',
				groupLabel: '知识库'
			},
			{
				title: '职业技能',
				icon: ListChecks,
				url: '/main/skills'
			},
			{
				title: '项目经验',
				icon: Sparkles,
				url: '/main/projects',
				groupLabel: '简历优化'

			},

			{
				title: '岗位数据获取',
				icon: CircleDollarSign,
				url: '/main/hjm/get-jobs',
				groupLabel: '人岗匹配'
			},
			{
				title: '简历匹配岗位',
				icon: Target,
				url: '/main/hjm/match-jobs'
			},
			{
				title: '岗位定制简历',
				icon: FileText,
				url: '/main/job'
			},
			{
				title: '集成面试题库和 anki',
				icon: Book,
				url: '/main/offer/anki',
				groupLabel: '面向offer学习'
			},
			{
				title: '教育经历',
				icon: GraduationCap,
				url: '/main/education',
				groupLabel: '简历编辑'
			},
			{
				title: '工作经历',
				icon: Briefcase,
				url: '/main/career'
			},
			{
				title: '简历组装、导出',
				icon: LayoutList,
				url: '/main/resumes'
			},
			{
				title: '简历编辑器',
				icon: SquarePen,
				url: '/main/resume-editor'
			},
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
