import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { ProjectVo } from '@prism-ai/shared';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomQuery } from '../../../query/config';
import { ProjectQueryKey } from '../../../query/keys';
import { findAllProjects } from '../../../services/project';
import { ConfigDataTable } from '../components/config-data-table';
import type { DataTableConfig } from '../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../components/config-data-table/data-table/columns/header';
import { DataTableRowActions } from '../components/config-data-table/data-table/columns/row-actions';
import { PageHeader } from '../components/PageHeader';
import { CreateProject } from './Create';

interface ProjectsProps {
	selectColShow?: boolean; // 是否显示选择列
	selectionHandler?: (...args: any) => void; //储存选中状态到store
	title?: string; // 页面标题
	description?: string; // 页面描述
}

export const Projects: React.FC<ProjectsProps> = ({
	selectColShow,
	selectionHandler,
	title,
	description
}) => {
	const { data, status } = useCustomQuery([ProjectQueryKey.Projects], findAllProjects);
	const navigate = useNavigate();
	if (status === 'pending') {
		return <div>Loading...</div>;
	}
	if (status === 'error') {
		return <div>错误:{data?.message}</div>;
	}

	const selectCol = selectColShow
		? [
				{
					id: '_select' as const,

					header: ({ table }: any) => (
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
					cell: ({ row }: any) => (
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
					cell: ({ row }) => <div className="w-[80px]">{row.original.info.name}</div>,
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
					)
				},
				{
					accessorKey: 'status',
					header: ({ column }) => <DataTableColumnHeader column={column} title="状态" />,
					cell: ({ row }) => (
						<div className="flex space-x-2">
							<Badge variant="default">{row.original.status}</Badge>
						</div>
					),
					filterFn: (row, id, value) => value.includes(row.getValue(id)),
					columnId: 'status',
					title: '状态',
					options: [
						{ label: 'Low', value: 'low' },
						{ label: 'Medium', value: 'medium' },
						{ label: 'High', value: 'high' }
					]
				},
				{
					accessorKey: 'score',
					header: ({ column }) => <DataTableColumnHeader column={column} title="评分" />,
					cell: ({ row }) => (
						<div className="flex space-x-2">
							<Badge variant="secondary">{row.original.lookupResult?.score ?? '待分析'}</Badge>
						</div>
					)
				}
			],

			selectCol,

			rowActionsCol: [
				{
					id: 'actions',
					cell: ({ row }) => <DataTableRowActions row={row} />
				}
			]
		},

		options: {
			toolbar: {
				enable: true,
				searchColId: 'name'
			},
			pagination: true
		},
		onRowClick: (index: number) => {
			return () => {
				navigate(`/main/projects/detail/${index}`, { state: { param: index } });
			};
		},
		createBtn: <CreateProject></CreateProject>,

		selectionHandler
	};

	return (
		<>
			<PageHeader
				title={title ?? '项目经验'}
				description={
					description ??
					'项目经验决定面试机会、面试表现。点击项目让 Prisma 深入分析你的项目、彻底优化你的项目经验'
				}
			></PageHeader>
			<div className="pl-10 pr-10 ">
				<ConfigDataTable dataTableConfig={dataTableConfig} data={data!.data}></ConfigDataTable>
			</div>
		</>
	);
};
