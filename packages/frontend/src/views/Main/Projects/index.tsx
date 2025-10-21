import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { ProjectVo } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import type { Row, Table } from '@tanstack/react-table';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { ProjectQueryKey } from '../../../query/keys';
import { findAllProjects, removeProject } from '../../../services/project';
import { ConfigDataTable } from '../components/config-data-table';
import type { DataTableConfig } from '../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../components/config-data-table/data-table/columns/header';
import { DataTableRowActions } from '../components/config-data-table/data-table/columns/row-actions';
import { PageHeader } from '../components/PageHeader';
import CreateProject from './Create';
import ProjectUpdate from './Update';

interface ProjectsProps<TData> {
	selectColShow?: boolean; // 是否显示选择列
	selectionHandler?: (rows: TData[]) => void; //储存选中状态到store
	title?: string; // 页面标题
	description?: string; // 页面描述
	mainTable?: boolean; // 是否为主表格
	collapsible?: boolean; // 是否为折叠组件
}

const Projects: React.FC<ProjectsProps<ProjectVo>> = ({
	selectColShow,
	selectionHandler,
	title,
	description,
	mainTable = true,
	collapsible = false
}) => {
	const { data, status } = useCustomQuery([ProjectQueryKey.Projects], findAllProjects);
	const queryClient = useQueryClient();
	const removeMutation = useCustomMutation(removeProject, {
		onSuccess: () => {
			toast.success('删除成功');
			queryClient.invalidateQueries({ queryKey: [ProjectQueryKey.Projects] });
		},
		onError: () => {
			toast.error('删除失败');
		}
	});
	const navigate = useNavigate();
	if (status === 'pending') {
		return <div></div>;
	}
	if (status === 'error') {
		return <div>错误:{data?.message}</div>;
	}
	const projectDatas = data.data;

	const selectCol = selectColShow
		? [
				{
					id: '_select' as const,

					header: ({ table }: { table: Table<ProjectVo> }) => (
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
					cell: ({ row }: { row: Row<ProjectVo> }) => (
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

	const dataTableConfig: DataTableConfig<ProjectVo> = {
		columns: {
			dataCols: [
				{
					accessorKey: 'name',
					header: ({ column }) => <DataTableColumnHeader column={column} title="名称" />,
					cell: ({ row }) => <div className="max-w-[160px] truncate">{row.original.name}</div>,
					enableHiding: false,
					enableSorting: false
				},
				{
					accessorKey: 'nameOfInfo',
					header: ({ column }) => <DataTableColumnHeader column={column} title="别名" />,
					cell: ({ row }) => (
						<div className="max-w-[160px] truncate">{row.original.nameOfInfo}</div>
					),
					enableHiding: false,
					enableSorting: false
				},
				{
					accessorKey: 'about',
					header: ({ column }) => <DataTableColumnHeader column={column} title="概要" />,
					cell: ({ row }) => (
						<div className="flex space-x-2">
							<span className="max-w-[500px] truncate font-medium">
								{row.original.info.desc.bgAndTarget ??
									row.original.info.desc.role ??
									row.original.info.desc.contribute}
							</span>
						</div>
					),
					enableSorting: false
				},
				// {
				// 	accessorKey: 'status',
				// 	header: ({ column }) => <DataTableColumnHeader column={column} title="状态" />,
				// 	cell: ({ row }) => (
				// 		<div className="flex space-x-2">
				// 			<Badge variant="default">{row.original.status}</Badge>
				// 		</div>
				// 	),
				// 	filterFn: (row, id, value) => value.includes(row.getValue(id)),
				// 	columnId: 'status',
				// 	title: '状态',
				// 	options: [
				// 		{ label: 'Low', value: 'low' },
				// 		{ label: 'Medium', value: 'medium' },
				// 		{ label: 'High', value: 'high' }
				// 	],
				// 	enableSorting: false
				// },
				{
					accessorKey: 'score',
					header: ({ column }) => <DataTableColumnHeader column={column} title="评分" />,
					cell: ({ row }) => (
						<div className="flex space-x-2">
							<Badge variant="secondary">{row.original.lookupResult?.score ?? '待分析'}</Badge>
						</div>
					),
					enableSorting: false
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
									component: <ProjectUpdate id={row.original.id} />
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
				enable: projectDatas.length > 10
			}
		},
		onRowClick: (rowData: ProjectVo) => {
			return () => {
				navigate(`/main/projects/action/${rowData.id}`, {
					state: { param: rowData.id }
				});
			};
		},
		createBtn: <CreateProject></CreateProject>,

		selectionHandler,
		mainTable
	};

	return (
		<>
			{!collapsible && (
				<PageHeader
					title={title ?? '项目经验'}
					description={
						description ??
						'项目经验决定面试机会、面试表现。点击项目让 Prisma 深入分析你的项目、彻底优化你的项目经验'
					}
				></PageHeader>
			)}
			<div className="pl-10 pr-10 ">
				<ConfigDataTable dataTableConfig={dataTableConfig} data={projectDatas}></ConfigDataTable>
			</div>
		</>
	);
};

export default Projects;
