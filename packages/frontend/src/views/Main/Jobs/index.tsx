import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { JobVo } from '@prism-ai/shared';
import type { Row, Table } from '@tanstack/react-table';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomQuery } from '../../../query/config';
import { JobQueryKey } from '../../../query/keys';
import { findAllUserJobs } from '../../../services/job';
import { ConfigDataTable } from '../components/config-data-table';
import type { DataTableConfig } from '../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../components/config-data-table/data-table/columns/header';
import { DataTableRowActions } from '../components/config-data-table/data-table/columns/row-actions';
import { PageHeader } from '../components/PageHeader';
import JobCreate from './JobCreate';

interface JobsProps {
	selectColShow?: boolean; // 是否显示选择列
	selectionHandler?: (...args: unknown[]) => void; //储存选中状态到store
}

const Jobs: React.FC<JobsProps> = ({ selectColShow, selectionHandler }) => {
	const navigate = useNavigate();
	const { data, status } = useCustomQuery([JobQueryKey.Jobs], () => findAllUserJobs(1, 100));

	if (status === 'pending') {
		return <div>Loading...</div>;
	}
	if (status === 'error') {
		return <div>错误:{data?.message}</div>;
	}
	const jobDatas = data.data?.data || [];

	const selectCol = selectColShow
		? [
				{
					id: '_select' as const,
					header: ({ table }: { table: Table<JobVo> }) => (
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
					cell: ({ row }: { row: Row<JobVo> }) => (
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

	const dataTableConfig: DataTableConfig<JobVo> = {
		columns: {
			dataCols: [
				{
					accessorKey: 'jobName',
					header: ({ column }) => <DataTableColumnHeader column={column} title="职位名称" />,
					cell: ({ row }) => {
						return <div className="w-[120px] font-medium">{row.original.jobName}</div>;
					},
					enableHiding: false,
					enableSorting: false
				},
				{
					accessorKey: 'companyName',
					header: ({ column }) => <DataTableColumnHeader column={column} title="公司名称" />,
					cell: ({ row }) => {
						return <div className="w-[120px]">{row.original.companyName}</div>;
					}
				},
				{
					accessorKey: 'location',
					header: ({ column }) => <DataTableColumnHeader column={column} title="工作地点" />,
					cell: ({ row }) => {
						return <div className="w-[100px]">{row.original.location || '未知'}</div>;
					}
				},
				{
					accessorKey: 'salary',
					header: ({ column }) => <DataTableColumnHeader column={column} title="薪资范围" />,
					cell: ({ row }) => {
						return <div className="w-[100px]">{row.original.salary || '面议'}</div>;
					}
				},
				{
					accessorKey: 'status',
					header: ({ column }) => <DataTableColumnHeader column={column} title="状态" />,
					cell: ({ row }) => {
						const status = row.original.status;
						return (
							<Badge variant={status === 'open' ? 'default' : 'secondary'}>
								{status === 'open' ? '开放' : '关闭'}
							</Badge>
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
					cell: ({ row }) => <DataTableRowActions row={row} />
				}
			]
		},

		options: {
			toolbar: {
				enable: true,
				searchColId: 'jobName'
			},
			pagination: true
		},
		onRowClick: (index: number) => {
			return () => {
				navigate(`/main/job/detail/${index}`, { state: { param: index } });
			};
		},
		createBtn: <JobCreate />,
		selectionHandler
	};

	return (
		<>
			<PageHeader
				title="岗位"
				description="追踪岗位, 并借助 Prisma 将您的简历与岗位信息进行匹配"
			></PageHeader>
			<div className="pl-10 pr-10">
				<ConfigDataTable dataTableConfig={dataTableConfig} data={jobDatas} />
			</div>
		</>
	);
};

export default Jobs;
