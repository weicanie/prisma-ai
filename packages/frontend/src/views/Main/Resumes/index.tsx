import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { ResumeVo } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import type { Row, Table } from '@tanstack/react-table';
import { Briefcase, GraduationCap, ListChecks, Target } from 'lucide-react';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useIsMobile } from '../../../hooks/use-mobile';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { ResumeQueryKey } from '../../../query/keys';
import { exportResumeToEditor, findAllUserResumes, removeResume } from '../../../services/resume';
import { setResumeData } from '../../../store/resume';
import Careers from '../Career';
import ClickCollapsible from '../components/ClickCollapsible';
import { ConfigDataTable } from '../components/config-data-table';
import type { DataTableConfig } from '../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../components/config-data-table/data-table/columns/header';
import { DataTableRowActions } from '../components/config-data-table/data-table/columns/row-actions';
import { PageHeader } from '../components/PageHeader';
import Educations from '../Education';
import Projects from '../Projects';
import Skills from '../Skills';
import ResumeCreate from './ResumeCreate';
interface ResumesProps<TData> {
	selectColShow?: boolean; // 是否显示选择列
	selectionHandler?: (rows: TData[]) => void; //储存选中状态到store
	title?: string; // 页面标题
	description?: string; // 页面描述
	mainTable?: boolean; // 是否为主表格
}

const Resumes: React.FC<ResumesProps<ResumeVo>> = ({
	selectColShow,
	selectionHandler,
	title,
	description,
	mainTable = true
}) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const isMobile = useIsMobile();

	const { data, status } = useCustomQuery([ResumeQueryKey.Resumes, 1, 1000], ({ queryKey }) => {
		const [, page, limit] = queryKey; // 从 queryKey 中解构分页参数
		return findAllUserResumes(page as number, limit as number);
	});
	const queryClient = useQueryClient();
	const removeMutation = useCustomMutation(removeResume, {
		onSuccess: () => {
			toast.success('删除成功');
			queryClient.invalidateQueries({ queryKey: [ResumeQueryKey.Resumes, 1, 1000] });
		},
		onError: () => {
			toast.error('删除失败');
		}
	});

	const exportToEditorMutation = useCustomMutation(exportResumeToEditor, {
		onSuccess: () => {
			toast.success('导出成功');
		},
		onError: () => {
			toast.error('导出失败');
		}
	});

	/* 挂载和卸载时重置选中项 */
	useEffect(() => {
		dispatch(setResumeData({ skill: '', projects: [], careers: [], educations: [] }));
	}, []);

	if (status === 'pending') {
		return <div></div>;
	}
	if (status === 'error') {
		return <div>错误:{data?.message}</div>;
	}
	const resumeDatas = data.data.data;

	const selectCol = selectColShow
		? [
				{
					id: '_select' as const,

					header: ({ table }: { table: Table<ResumeVo> }) => (
						<Checkbox
							checked={
								table.getIsAllPageRowsSelected() ||
								(table.getIsSomePageRowsSelected() && 'indeterminate')
							}
							onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
							aria-label="Select all"
							className="translate-y-[2px]"
						/>
					),
					cell: ({ row }: { row: Row<ResumeVo> }) => (
						<Checkbox
							checked={row.getIsSelected()}
							onCheckedChange={value => row.toggleSelected(!!value)}
							aria-label="Select row"
							className="translate-y-[2px]"
						/>
					),
					enableSorting: false,
					enableHiding: false
				}
			]
		: [];

	const dataTableConfig: DataTableConfig<ResumeVo> = {
		columns: {
			dataCols: [
				{
					accessorKey: 'name',
					header: ({ column }) => <DataTableColumnHeader column={column} title="简历名称" />,
					cell: ({ row }) => {
						return <div className="w-[200px] font-medium">{row.original.name}</div>;
					},
					enableHiding: false,
					enableSorting: true
				},
				{
					accessorKey: 'skill',
					header: ({ column }) => <DataTableColumnHeader column={column} title="职业技能" />,
					cell: ({ row }) => {
						const skill = row.original.skill;
						if (!skill?.content?.length) {
							return <div className="text-gray-500">未关联技能</div>;
						}
						const displaySkill = skill.content.slice(0, 2);
						const remainingCount = skill.content.length - 2;
						return (
							<div className="flex flex-wrap gap-1 max-w-[300px]">
								{displaySkill.map((skill, index) => (
									<Badge key={skill.type || index} variant="secondary" className="text-xs">
										{skill.type || '未分类'}
									</Badge>
								))}
								{remainingCount > 0 && (
									<Badge variant="default" className="text-xs">
										+{remainingCount}个技能
									</Badge>
								)}
							</div>
						);
					},
					enableHiding: false,
					enableSorting: false
				},
				{
					accessorKey: 'projects',
					header: ({ column }) => <DataTableColumnHeader column={column} title="项目经验" />,
					cell: ({ row }) => {
						const projects = row.original.projects || [];
						if (projects.length === 0) {
							return <div className="text-gray-500">无项目经验</div>;
						}
						const displayProjects = projects.slice(0, 2);
						const remainingCount = projects.length - 2;

						return (
							<div className="flex flex-wrap gap-1 max-w-[300px]">
								{displayProjects.map((project, index) => (
									<Badge key={project.id || index} variant="secondary" className="text-xs">
										{project.name || project.info?.name || '未命名项目'}
									</Badge>
								))}
								{remainingCount > 0 && (
									<Badge variant="default" className="text-xs">
										+{remainingCount}个项目
									</Badge>
								)}
							</div>
						);
					}
				},
				{
					accessorKey: 'updatedAt',
					header: ({ column }) => <DataTableColumnHeader column={column} title="更新时间" />,
					cell: ({ row }) => {
						const date = row.original.updatedAt
							? new Date(row.original.updatedAt).toLocaleDateString()
							: '未知';
						return <div className="text-sm text-gray-500">{date}</div>;
					}
				}
			],

			selectCol,

			rowActionsCol: [
				{
					id: 'actions',
					cell: ({ row }) => (
						<DataTableRowActions
							row={row}
							actions={[
								{
									label: '删除',
									onClick: () => {
										removeMutation.mutate(row.original.id);
									}
								},
								{
									label: '导出',
									onClick: () => {
										exportToEditorMutation.mutate(row.original.id);
									}
								}
							]}
						/>
					)
				}
			]
		},

		options: {
			toolbar: {
				enable: true,
				searchColIds: ['name']
			},
			pagination: {
				enable: resumeDatas.length > 10
			}
		},
		onRowClick: (rowData: ResumeVo) => {
			return () => {
				navigate(`resume-detail/${rowData.id}`, {
					state: { param: rowData.id }
				});
			};
		},
		createBtn: <ResumeCreate />,
		selectionHandler,
		mainTable
	};
	const SkillsProps = {
		selectColShow: true,
		//将选中状态存储到store
		selectionHandler: (selectedRows: unknown[]) => {
			dispatch(setResumeData({ skill: (selectedRows[0] as ResumeVo)?.id }));
		},
		title: '',
		description: '',
		mainTable: false,
		collapsible: true
	};
	const ProjectsProps = {
		selectColShow: true,
		//将选中状态存储到store
		selectionHandler: (selectedRows: unknown[]) => {
			dispatch(
				setResumeData({
					projects: selectedRows.map((row: unknown): string => (row as { id: string }).id!)
				})
			);
		},
		title: '',
		description: '',
		mainTable: false,
		collapsible: true
	};
	const CareersProps = {
		selectColShow: true,
		selectionHandler: (selectedRows: unknown[]) => {
			dispatch(
				setResumeData({
					careers: selectedRows.map((row: unknown): string => (row as { id: string }).id!)
				})
			);
		},
		title: '',
		description: '',
		mainTable: false,
		collapsible: true
	};
	const EducationsProps = {
		selectColShow: true,
		selectionHandler: (selectedRows: unknown[]) => {
			dispatch(
				setResumeData({
					educations: selectedRows.map((row: unknown): string => (row as { id: string }).id!)
				})
			);
		},
		title: '',
		description: '',
		mainTable: false,
		collapsible: true
	};

	return (
		<div className="pb-7">
			<PageHeader
				title={title ?? '简历'}
				description={description ?? '组装您的简历并导出到简历编辑器进行编辑'}
			>
				<Button
					variant="outline"
					onClick={() => navigate('/main/resumes/skills')}
					className={`flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}
				>
					<ListChecks className={`h-4 w-4 ${isMobile ? 'h-3 w-3' : ''}`} />
					职业技能
				</Button>
				<Button
					variant="outline"
					onClick={() => navigate('/main/resumes/career')}
					className={`flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}
				>
					<Briefcase className={`h-4 w-4 ${isMobile ? 'h-3 w-3' : ''}`} />
					工作经历
				</Button>
				<Button
					variant="outline"
					onClick={() => navigate('/main/resumes/education')}
					className={`flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}
				>
					<GraduationCap className={`h-4 w-4 ${isMobile ? 'h-3 w-3' : ''}`} />
					教育经历
				</Button>
			</PageHeader>
			<div className="pl-10 pr-10">
				<ConfigDataTable dataTableConfig={dataTableConfig} data={resumeDatas} />
			</div>
			{/* 作为主表格时，显示专业技能和项目经验表格 */}
			{mainTable && (
				<div className="mt-9 space-y-3 px-4">
					<ClickCollapsible
						title={<h2 className="text-base">选择一个职业技能</h2>}
						icon={<ListChecks className="size-5" />}
						className="px-6"
						defaultOpen={false}
					>
						<Skills {...SkillsProps}></Skills>
					</ClickCollapsible>
					<ClickCollapsible
						title={<h2 className="text-base">选择若干项目经验</h2>}
						icon={<Target className="size-5" />}
						className="px-6"
						defaultOpen={false}
					>
						<Projects {...ProjectsProps}></Projects>
					</ClickCollapsible>
					<ClickCollapsible
						title={<h2 className="text-base">选择若干工作经历</h2>}
						icon={<Briefcase className="size-5" />}
						className="px-6"
						defaultOpen={false}
					>
						<Careers {...CareersProps}></Careers>
					</ClickCollapsible>
					<ClickCollapsible
						title={<h2 className="text-base">选择若干教育经历</h2>}
						icon={<GraduationCap className="size-5" />}
						className="px-6"
						defaultOpen={false}
					>
						<Educations {...EducationsProps}></Educations>
					</ClickCollapsible>
				</div>
			)}
		</div>
	);
};

export default Resumes;
