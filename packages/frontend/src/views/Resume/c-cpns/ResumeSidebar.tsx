import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@radix-ui/react-dropdown-menu';
import {
	BicepsFlexed,
	ChevronDown,
	ChevronUp,
	FileSearch,
	FileUp,
	Laugh,
	LibraryBig,
	Pyramid,
	Sparkle,
	Star,
	Sunrise,
	User2
} from 'lucide-react';
import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// menu item 和路由
const itemsWelcome = [
	{
		title: '简历为什么重要',
		url: '#',
		icon: Sunrise
	},
	{
		title: '简历是一门手艺',
		url: '#',
		icon: BicepsFlexed
	},
	{
		title: '为什么选择我们',
		url: '#',
		icon: Laugh
	},
	{
		title: '一起贡献本项目',
		url: '#',
		icon: Star
	}
];
const itemsGeneral = [
	{
		title: '项目经验上传',
		url: '/resume/upload', //! 坑: 使用a元素跳转会强制刷新页面,无法实现路由!
		icon: FileUp
	},
	{
		title: '项目经验评估、改进',
		url: '#',
		icon: FileSearch
	},
	{
		title: '项目经验亮点挖掘',
		url: '#',
		icon: Sparkle
	},
	{
		title: '项目经验延申八股', //技术点、面试题
		url: '#',
		icon: LibraryBig
	}
];
function ResumeSidebar() {
	// const { state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar } = useSidebar();
	const [group, setGroup] = useState([itemsWelcome, itemsGeneral]);
	const [selectedGroup, setSelectedGroup] = useState(0);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const navigate = useNavigate();
	function getClickHandler(index: number, groupIndex: number) {
		//使用闭包追踪按钮点击
		return (e: any) => {
			e.stopPropagation();
			navigate(group[groupIndex][index].url);
			setSelectedGroup(groupIndex);
			setSelectedIndex(index);
		};
	}
	console.log('ResumeSidebar', selectedGroup, selectedIndex);
	return (
		<Sidebar
			// side="left | right"
			//如果你使用 inset 变体，请记得将你的主内容包裹在 SidebarInset 组件中
			//variant="sidebar | floating | inset"
			//折叠行为
			// collapsible="offcanvas | icon | none"
			collapsible="icon"
		>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton>
									<Pyramid></Pyramid>
									简历灵感菇：从简历到offer
									<ChevronDown className="ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-[--radix-popper-anchor-width]">
								<DropdownMenuItem>
									<span>文档</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>关于</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent className="overflow-hidden">
				<Collapsible defaultOpen className="group/collapsible">
					<SidebarGroup>
						<CollapsibleTrigger>
							<SidebarGroupLabel>
								介绍
								<ChevronDown className="ml-auto" />
							</SidebarGroupLabel>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<SidebarGroupContent>
								<Collapsible defaultOpen className="group/collapsible">
									<SidebarMenu>
										{itemsWelcome.map((item, index, arr) => (
											<SidebarMenuItem key={item.title}>
												<SidebarMenuButton
													asChild
													onClick={getClickHandler(index, group.indexOf(arr))}
													isActive={index === selectedIndex && arr === group[selectedGroup]}
												>
													<span>
														<item.icon />
														<span>{item.title}</span>
													</span>
												</SidebarMenuButton>

												{/* <SidebarMenuSub>
														<SidebarMenuSubItem>
															<SidebarMenuSubButton>子菜单项</SidebarMenuSubButton>
														</SidebarMenuSubItem>
													</SidebarMenuSub> */}
											</SidebarMenuItem>
										))}
									</SidebarMenu>
								</Collapsible>
							</SidebarGroupContent>
						</CollapsibleContent>
					</SidebarGroup>
				</Collapsible>
				<Collapsible defaultOpen className="group/collapsible">
					<SidebarGroup>
						<CollapsibleTrigger>
							<SidebarGroupLabel>
								通用简历
								<ChevronDown className="ml-auto" />
							</SidebarGroupLabel>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<SidebarGroupContent>
								<Collapsible defaultOpen className="group/collapsible">
									<SidebarMenu>
										{itemsGeneral.map((item, index, arr) => (
											<SidebarMenuItem key={item.title}>
												<SidebarMenuButton
													asChild
													onClick={getClickHandler(index, group.indexOf(arr))}
													isActive={index === selectedIndex && arr === group[selectedGroup]}
												>
													<span>
														<item.icon />
														<span>{item.title}</span>
													</span>
												</SidebarMenuButton>

												{/* <SidebarMenuSub>
														<SidebarMenuSubItem>
															<SidebarMenuSubButton>子菜单项</SidebarMenuSubButton>
														</SidebarMenuSubItem>
													</SidebarMenuSub> */}
											</SidebarMenuItem>
										))}
									</SidebarMenu>
								</Collapsible>
							</SidebarGroupContent>
						</CollapsibleContent>
					</SidebarGroup>
				</Collapsible>

				<SidebarSeparator />

				<SidebarGroup>
					<SidebarGroupLabel>专用简历</SidebarGroupLabel>
					<SidebarGroupContent></SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator />

				<SidebarGroup>
					<SidebarGroupLabel>面向 offer 学习</SidebarGroupLabel>
					<SidebarGroupContent></SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton>
									<User2 /> Username
									<ChevronUp className="ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
								<DropdownMenuItem>
									<span>账户</span>
								</DropdownMenuItem>
								{/* <DropdownMenuItem>
									<span>订单</span>
								</DropdownMenuItem> */}
								<DropdownMenuItem>
									<span>退出登录</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
export default memo(ResumeSidebar);
