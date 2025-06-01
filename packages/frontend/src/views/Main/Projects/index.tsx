import { Badge } from '@/components/ui/badge';
import type { ProjectVo } from '@prism-ai/shared';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import React from 'react';
import { useCustomQuery } from '../../../query/config';
import { ProjectQueryKey } from '../../../query/project';
import { findAllProjects } from '../../../services/project';
import { ConfigDataTable } from '../components/config-data-table';
import type { DataTableConfig } from '../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../components/config-data-table/data-table/columns/header';
import { DataTableRowActions } from '../components/config-data-table/data-table/columns/row-actions';
import { PageHeader } from '../components/PageHeader';

export const dataTableConfig: DataTableConfig<ProjectVo> = {
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
						<Badge variant="outline">{row.original.status}</Badge>
					</div>
				),
				filterFn: (row, id, value) => value.includes(row.getValue(id)),
				columnId: 'status',
				title: '状态',
				options: [
					{ label: 'Low', value: 'low', icon: ArrowDown },
					{ label: 'Medium', value: 'medium', icon: ArrowRight },
					{ label: 'High', value: 'high', icon: ArrowUp }
				]
			},
			{
				accessorKey: 'score',
				header: ({ column }) => <DataTableColumnHeader column={column} title="评分" />,
				cell: ({ row }) => (
					<div className="flex space-x-2">
						<Badge variant="outline">{row.original.lookupResult.score}</Badge>
					</div>
				)
			}
		],

		selectCol: [],

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
	}
};

interface ProjectsProps {}

export const Projects: React.FC<ProjectsProps> = props => {
	const { data, status } = useCustomQuery([ProjectQueryKey.Project], findAllProjects);
	if (status === 'pending') {
		return <div>Loading...</div>;
	}
	if (status === 'error') {
		return <div>错误:{data?.message}</div>;
	}
	return (
		<>
			<PageHeader title="项目经验" description="这是你的项目经验"></PageHeader>
			<div className="pl-10 pr-10 ">
				<ConfigDataTable dataTableConfig={dataTableConfig} data={data!.data}></ConfigDataTable>
			</div>
		</>
	);
};
