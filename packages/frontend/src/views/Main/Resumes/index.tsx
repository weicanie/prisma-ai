import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { ResumeVo } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import type { Row, Table } from '@tanstack/react-table';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { ResumeQueryKey } from '../../../query/keys';
import { findAllUserResumes, removeResume } from '../../../services/resume';
import { setResumeData } from '../../../store/resume';
import { ConfigDataTable } from '../components/config-data-table';
import type { DataTableConfig } from '../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../components/config-data-table/data-table/columns/header';
import { DataTableRowActions } from '../components/config-data-table/data-table/columns/row-actions';
import { PageHeader } from '../components/PageHeader';
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

	/* 挂载和卸载时重置选中的职业技能和项目经验 */
	useEffect(() => {
		dispatch(setResumeData({ skill: '', projects: [] }));
	}, []);

	if (status === 'pending') {
		return <div>Loading...</div>;
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
				enable: true
			}
		},
		onRowClick: (rowData: ResumeVo) => {
			return () => {
				navigate(`/main/resumes/detail/${rowData.id}`, {
					state: { param: rowData.id }
				});
			};
		},
		createBtn: <ResumeCreate />,
		selectionHandler,
		mainTable
	};
	//添加选择列
	const SkillsProps = {
		selectColShow: true,
		//将选中状态存储到store
		selectionHandler: (selectedRows: unknown[]) => {
			dispatch(setResumeData({ skill: (selectedRows[0] as ResumeVo)?.id }));
		},
		title: '',
		description: '选择一个职业技能',
		mainTable: false
	};
	//添加选择列
	const ProjectsProps = {
		selectColShow: true,
		//将选中状态存储到store
		selectionHandler: (selectedRows: unknown[]) => {
			dispatch(
				setResumeData({
					projects: selectedRows.map((row: unknown): string => (row as ResumeVo).id!)
				})
			);
		},
		title: '',
		description: '选择若干项目经验',
		mainTable: false
	};

	return (
		<>
			<PageHeader
				title={title ?? '简历'}
				description={description ?? '选择一个职业技能, 若干项目经验, 组合成您的简历'}
			></PageHeader>
			<div className="pl-10 pr-10">
				<ConfigDataTable dataTableConfig={dataTableConfig} data={resumeDatas} />
			</div>
			{/* 作为主表格时，显示专业技能和项目经验表格 */}
			{mainTable && (
				<>
					<Skills {...SkillsProps}></Skills>
					<Projects {...ProjectsProps}></Projects>
				</>
			)}
		</>
	);
};

export default Resumes;
