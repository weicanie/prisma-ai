import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { EllipsisVertical, MessagesSquare, SquarePen } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import ClickCollapsible from '../components/ClickCollapsible';

export type Conversation = {
	key: string;
	label: string;
	group: string;
};

export type MenuItem = {
	key: string;
	label: string;
	icon?: React.ReactNode;
	danger?: boolean;
	onClick?: () => void;
};

export type ConversationsProps = {
	items: Conversation[];
	activeKey?: string;
	onActiveChange?: (key: string) => void;
	className?: string;
	menu?: (conversation: Conversation) => { items: MenuItem[] };
	handleNewConversation: () => Promise<void>;
};

/**
 * 会话列表组件
 * @param props
 * @returns
 */
export default function Conversations({
	items,
	activeKey,
	onActiveChange,
	className,
	menu,
	handleNewConversation
}: ConversationsProps) {
	// 控制悬浮卡片的显示和隐藏
	const [isOpen, setIsOpen] = useState(false);

	// 获取当前选中的会话
	const activeConversation = useMemo(
		() => items.find(c => c.key === activeKey),
		[items, activeKey]
	);

	// 按group字段对会话进行分组
	const groupedConversations = useMemo(() => {
		return items.reduce(
			(acc, item) => {
				(acc[item.group] = acc[item.group] || []).push(item);
				return acc;
			},
			{} as Record<string, Conversation[]>
		);
	}, [items]);

	// 对分组进行排序，"今天"在最前面，其他按日期降序
	const sortedGroups = useMemo(() => {
		return Object.keys(groupedConversations).sort((a, b) => {
			if (a === '今天') return -1;
			if (b === '今天') return 1;
			return b.localeCompare(a); // 日期字符串降序排序
		});
	}, [groupedConversations]);

	return (
		<div className={cn('relative w-full flex justify-center', className)}>
			<div className="w-full flex items-center justify-between sm:justify-center sm:gap-7">
				{/* 触发器：始终显示当前会话 */}
				<Button
					variant="outline"
					className="w-fit justify-start items-center text-left h-9 rounded-[50px] dark:text-zinc-300"
					onClick={() => setIsOpen(!isOpen)}
				>
					<MessagesSquare className="size-4 mr-1 shrink-0 dark:text-zinc-300" />
					对话列表
				</Button>
				{/*添加会话 */}
				<Button
					onClick={handleNewConversation}
					variant="outline"
					className="dark:text-zinc-300 rounded-[50px]"
				>
					<SquarePen className="size-4 mr-1 shrink-0 dark:text-zinc-300" />
					新建对话
				</Button>
			</div>

			{/* 悬浮内容：使用AnimatePresence和motion实现MUI风格的动画 */}
			<AnimatePresence>
				{isOpen && (
					<>
						{/* 蒙板：点击后关闭弹窗 */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsOpen(false)}
							className="fixed inset-0 bg-black/50 z-40"
						/>

						{/* 弹窗内容 */}
						<motion.div
							initial={{ opacity: 0, y: -5, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -5, scale: 0.98 }}
							transition={{ duration: 0.2, ease: 'easeInOut' }}
							className="absolute bottom-full mb-3 w-[min(500px,80vw)] border bg-global rounded-md shadow-lg z-50 p-3"
						>
							<div className="h-auto max-h-[50vh] overflow-y-auto scb-thin">
								<div className="flex flex-col">
									{sortedGroups.map(group => (
										<ClickCollapsible
											key={group}
											title={<Badge variant="outline">{group}</Badge>}
											defaultOpen={group === '今天' || group === activeConversation?.group}
											className="p-0"
										>
											<div className="pl-2 flex flex-col gap-1 py-1">
												{groupedConversations[group].map(item => (
													<div
														key={item.key}
														className="group/item flex items-center justify-between w-full rounded-md hover:bg-muted/50"
													>
														<Button
															variant={item.key === activeKey ? 'secondary' : 'ghost'}
															className="h-8 flex-1 justify-start text-left truncate text-xs"
															onClick={() => onActiveChange?.(item.key)}
														>
															<span className="truncate">{item.label}</span>
														</Button>
														{/* 会话操作菜单 */}
														{menu && (
															<Popover>
																<PopoverTrigger asChild>
																	<Button
																		variant="ghost"
																		size="icon"
																		className="size-7 shrink-0 opacity-0 group-hover/item:opacity-100"
																	>
																		<EllipsisVertical className="size-4" />
																	</Button>
																</PopoverTrigger>
																<PopoverContent className="w-auto p-1">
																	{menu(item).items.map(menuItem => (
																		<Button
																			key={menuItem.key}
																			variant={menuItem.danger ? 'ghost' : 'ghost'}
																			className={cn('w-full text-xs h-8 px-2 justify-start', {
																				'text-destructive hover:text-destructive hover:bg-destructive/10':
																					menuItem.danger
																			})}
																			onClick={menuItem.onClick}
																		>
																			{menuItem.icon && (
																				<div className="mr-2 size-4">{menuItem.icon}</div>
																			)}
																			{menuItem.label}
																		</Button>
																	))}
																</PopoverContent>
															</Popover>
														)}
													</div>
												))}
											</div>
										</ClickCollapsible>
									))}
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
