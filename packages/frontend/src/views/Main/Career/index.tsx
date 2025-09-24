import { Checkbox } from '@/components/ui/checkbox';
import type { CareerVO } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import type { Row, Table } from '@tanstack/react-table';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { CareerQueryKey } from '../../../query/keys';
import { findAllCareers, removeCareer } from '../../../services/career';
import { ConfigDataTable } from '../components/config-data-table';
import type { DataTableConfig } from '../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../components/config-data-table/data-table/columns/header';
import { DataTableRowActions } from '../components/config-data-table/data-table/columns/row-actions';
import { PageHeader } from '../components/PageHeader';
import CareerCreate from './Create';
import CareerUpdate from './Update';

interface CareersProps<TData> {
	selectColShow?: boolean; // 是否显示选择列
	selectionHandler?: (rows: TData[]) => void; //储存选中状态到store
	title?: string; // 页面标题
	description?: string; // 页面描述
	mainTable?: boolean; // 是否为主表格
	collapsible?: boolean; // 是否为折叠组件
}

const Careers: React.FC<CareersProps<CareerVO>> = ({
	selectColShow,
	selectionHandler,
	title,
	description,
	mainTable = true,
	collapsible = false
}) => {
	const { data, status } = useCustomQuery([CareerQueryKey.Careers], () => findAllCareers());
	const queryClient = useQueryClient();
	const removeMutation = useCustomMutation(removeCareer, {
		onSuccess: () => {
			toast.success('删除成功');
			queryClient.invalidateQueries({ queryKey: [CareerQueryKey.Careers] });
		},
		onError: () => {
			toast.error('删除失败');
		}
	});

	const navigate = useNavigate();

	if (status === 'pending') return <div></div>;
	if (status === 'error') return <div>错误:{data?.message}</div>;

	const careerData = data.data;

	const selectCol = selectColShow
		? [
				{
					id: '_select' as const,
					header: ({ table }: { table: Table<CareerVO> }) => (
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
					cell: ({ row }: { row: Row<CareerVO> }) => (
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

	const dataTableConfig: DataTableConfig<CareerVO> = {
		columns: {
			dataCols: [
				{
					accessorKey: 'company',
					header: ({ column }) => <DataTableColumnHeader column={column} title="公司" />,
					cell: ({ row }) => <div className="w-[160px] font-medium">{row.original.company}</div>,
					enableHiding: false,
					enableSorting: false
				},
				{
					accessorKey: 'position',
					header: ({ column }) => <DataTableColumnHeader column={column} title="职位" />,
					enableSorting: false
				},
				{
					accessorKey: 'startDate',
					header: ({ column }) => <DataTableColumnHeader column={column} title="入职日期" />,
					cell: ({ row }) => <div>{row.original.startDate?.slice(0, 10)}</div>
				},
				{
					accessorKey: 'endDate',
					header: ({ column }) => <DataTableColumnHeader column={column} title="离职日期" />,
					cell: ({ row }) => <div>{row.original.endDate?.slice(0, 10) || '在职'}</div>
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
									onClick: () => removeMutation.mutate(row.original.id)
								},
								{
									component: <CareerUpdate id={row.original.id} />
								}
							]}
						/>
					)
				}
			]
		},
		options: {
			toolbar: { enable: true, searchColIds: ['company', 'position'] },
			pagination: { enable: careerData.length > 10 }
		},
		onRowClick: (rowData: CareerVO) => () => {
			navigate(`career-detail/${rowData?.id}`, {
				state: { param: rowData.id }
			});
		},
		createBtn: <CareerCreate />,
		selectionHandler,
		mainTable
	};

	return (
		<>
			{!collapsible && (
				<PageHeader title={title ?? '工作经历'} description={description ?? '管理你的工作经历'} />
			)}
			<div className="pl-10 pr-10">
				<ConfigDataTable dataTableConfig={dataTableConfig} data={careerData} />
			</div>
		</>
	);
};

export default Careers;
