import { ChevronRight, type LucideIcon } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarSeparator
} from '@/components/ui/sidebar';
import { Fragment } from 'react/jsx-runtime';
import { cn } from '../../../../lib/utils';
import { preloadOnItemHover } from '../../../../utils/preloadOnItemHover';

type NavMainProps = {
	items: {
		title: string;
		url?: string;
		icon?: LucideIcon;
		iconClassName?: string;
		isOpen?: boolean; // 是否默认展开
		groupLabel?: string;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
	selectedGroupIndex: number; // 当前选中的组索引
	selectedItemIndex: number;
	onItemClick: (groupIndex: number, itemIndex: number, url: string) => void;
};

export function NavMain({
	items,
	selectedGroupIndex,
	selectedItemIndex,
	onItemClick
}: NavMainProps) {
	return (
		<SidebarGroup className="space-y-5">
			<SidebarMenu className="space-y-2">
				{items.map((item, groupIdx) => {
					//主项是否被选中：当没有子项时,选中的组选中主项
					const isMainItemActive =
						selectedGroupIndex === groupIdx &&
						(selectedItemIndex === -1 || !item.items || item.items.length === 0);

					if (!item.items || item.items.length === 0) {
						//如果没有子项，渲染为无折叠的菜单项
						return (
							<Fragment key={item.title}>
								{item.groupLabel && (
									<SidebarGroupLabel className="group-data-[state=collapsed]:hidden">
										{item.groupLabel}
									</SidebarGroupLabel>
								)}
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										// asChild
										// asChild属性会透传props给子组件,然后渲染子组件而非原组件
										tooltip={item.title}
										isActive={isMainItemActive}
										onClick={() => item.url && onItemClick(groupIdx, -1, item.url)}
										className="cursor-pointer"
									>
										{item.icon && (
											<item.icon
												className={cn(
													item.iconClassName,
													'dark:group-data-[state=collapsed]:text-zinc-300',
													'group-data-[state=collapsed]:text-zinc-700'
												)}
											/>
										)}
										<span>{item.title}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</Fragment>
						);
					}

					//如果有子项，渲染为可折叠的菜单项
					return (
						<Fragment key={item.title}>
							{item.groupLabel ? (
								<SidebarGroupLabel className="group-data-[state=collapsed]:hidden">
									{item.groupLabel}
								</SidebarGroupLabel>
							) : (
								<SidebarSeparator />
							)}
							<Collapsible
								key={item.title}
								asChild
								defaultOpen={item.isOpen || selectedGroupIndex === groupIdx}
								className="group/collapsible"
							>
								<SidebarMenuItem>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton
											tooltip={item.title}
											isActive={isMainItemActive}
											className="cursor-pointer"
										>
											{item.icon && (
												<item.icon
													className={cn(
														item.iconClassName,
														//group：Sidebar
														//group/collapsible: Collapsible
														'group-data-[state=closed]/collapsible:text-zinc-700 dark:group-data-[state=closed]/collapsible:text-zinc-300',
														'group-data-[state=collapsed]:text-zinc-700 dark:group-data-[state=collapsed]:text-zinc-300'
													)}
												/>
											)}
											<span>{item.title}</span>
											<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items?.map((subItem, subIdx) => (
												<SidebarMenuSubItem key={subItem.title}>
													<SidebarMenuSubButton
														asChild
														isActive={
															selectedGroupIndex === groupIdx && selectedItemIndex === subIdx
														}
														onClick={() => onItemClick(groupIdx, subIdx, subItem.url)}
														onMouseEnter={() => preloadOnItemHover(subItem.url)}
														className="cursor-pointer"
													>
														<span>{subItem.title}</span>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						</Fragment>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
