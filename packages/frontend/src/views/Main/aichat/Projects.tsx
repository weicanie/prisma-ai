import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useCustomQuery } from '@/query/config';
import { ProjectQueryKey } from '@/query/keys';
import { findAllProjects } from '@/services/project';
import { selectAIChatProjectId, setAIChatProjectId } from '@/store/aichat';
import { AnimatePresence, motion } from 'framer-motion';
import { EllipsisVertical, FolderOpen, Plus } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ClickCollapsible from '../components/ClickCollapsible';

export type Project = {
	key: string;
	label: string;
	group: string;
	score?: number;
	status: string;
};

export type MenuItem = {
	key: string;
	label: string;
	icon?: React.ReactNode;
	danger?: boolean;
	onClick?: () => void;
};

export type ProjectsProps = {
	className?: string;
	menu?: (project: Project) => { items: MenuItem[] };
	onProjectSelect?: (projectId: string) => void;
};

/**
 * 项目选择组件
 * @param props
 * @returns
 */
export default function Projects({ className, menu, onProjectSelect }: ProjectsProps) {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const activeProjectId = useSelector(selectAIChatProjectId);

	// 控制悬浮卡片的显示和隐藏
	const [isOpen, setIsOpen] = useState(false);

	// 获取项目经验数据
	const { data, status } = useCustomQuery([ProjectQueryKey.Projects], findAllProjects);

	// 转换项目数据格式
	const projects: Project[] = useMemo(() => {
		if (status !== 'success' || !data?.data) return [];

		return data.data.map(project => ({
			key: project.id,
			label: project.name,
			group: '项目经验',
			score: project.lookupResult?.score,
			status: project.status
		}));
	}, [data, status]);

	// 获取当前选中的项目
	const activeProject = useMemo(
		() => projects.find(p => p.key === activeProjectId),
		[projects, activeProjectId]
	);

	// 按group字段对项目进行分组
	const groupedProjects = useMemo(() => {
		return projects.reduce(
			(acc, item) => {
				(acc[item.group] = acc[item.group] || []).push(item);
				return acc;
			},
			{} as Record<string, Project[]>
		);
	}, [projects]);

	// 对分组进行排序，项目经验组
	const sortedGroups = useMemo(() => {
		return Object.keys(groupedProjects).sort((a, b) => {
			return a.localeCompare(b);
		});
	}, [groupedProjects]);

	const timerRef = useRef<number>();
	// 设置默认选中第一个项目
	useEffect(() => {
		if (projects.length > 0 && !activeProjectId) {
			const firstProject = projects[0];
			dispatch(setAIChatProjectId(firstProject.key));
			onProjectSelect?.(firstProject.key);
		} else if (projects && projects.length === 0) {
			//用户当前没有项目时，跳转创建项目经验页面
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
			timerRef.current = setTimeout(() => {
				toast.info('请先创建至少一个项目经验');
				navigate('/main/projects');
			}, 500);
		}
	}, [projects, activeProjectId, dispatch, onProjectSelect]);

	// 处理项目选择
	const handleProjectSelect = (projectId: string) => {
		dispatch(setAIChatProjectId(projectId));
		onProjectSelect?.(projectId);
		setIsOpen(false);
	};

	// 如果正在加载，显示加载状态
	if (status === 'pending') {
		return (
			<div className={cn('relative w-full flex justify-center', className)}>
				<Button
					variant="outline"
					disabled
					className="w-fit justify-start items-center text-left h-9 rounded-[50px] dark:text-zinc-300"
				>
					<FolderOpen className="size-4 mr-1 shrink-0 dark:text-zinc-300" />
					加载中...
				</Button>
			</div>
		);
	}

	// 如果加载失败
	if (status === 'error') {
		return (
			<div className={cn('relative w-full flex justify-center', className)}>
				<Button
					variant="outline"
					disabled
					className="w-fit justify-start items-center text-left h-9 rounded-[50px] text-red-500"
				>
					<FolderOpen className="size-4 mr-1 shrink-0" />
					加载失败
				</Button>
			</div>
		);
	}

	// 如果没有项目
	if (projects.length === 0) {
		return (
			<div className={cn('relative w-full flex justify-center', className)}>
				<Button
					variant="outline"
					disabled
					className="w-fit justify-start items-center text-left h-9 rounded-[50px] dark:text-zinc-300"
				>
					<Plus className="size-4 mr-1 shrink-0 dark:text-zinc-300" />
					暂无项目
				</Button>
			</div>
		);
	}

	return (
		<>
			{/* 触发器：显示当前选中的项目 */}
			<Button
				variant="outline"
				className="w-fit justify-start items-center text-left h-9 rounded-[50px] dark:text-zinc-300"
				onClick={() => setIsOpen(!isOpen)}
			>
				<FolderOpen className="size-4 mr-1 shrink-0 dark:text-zinc-300" />
				{activeProject ? activeProject.label : '选择项目'}
				{/* {activeProject?.score && (
						<Badge variant="secondary" className="ml-2 text-xs">
							{activeProject.score}分
						</Badge>
					)} */}
			</Button>

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
											defaultOpen={true}
											className="p-0"
										>
											<div className="pl-2 flex flex-col gap-1 py-1">
												{groupedProjects[group].map(item => (
													<div
														key={item.key}
														className="group/item flex items-center justify-between w-full rounded-md hover:bg-muted/50"
													>
														<Button
															variant={item.key === activeProjectId ? 'secondary' : 'ghost'}
															className="h-8 flex-1 justify-start text-left truncate text-xs"
															onClick={() => handleProjectSelect(item.key)}
														>
															<span className="truncate">{item.label}</span>
															{item.score && (
																<Badge variant="secondary" className="ml-2 text-xs">
																	{item.score}分
																</Badge>
															)}
														</Button>
														{/* 项目操作菜单 */}
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
		</>
	);
}
