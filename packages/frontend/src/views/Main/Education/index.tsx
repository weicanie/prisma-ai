import { Checkbox } from '@/components/ui/checkbox';
import type { EducationVO } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import type { Row, Table } from '@tanstack/react-table';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { EducationQueryKey } from '../../../query/keys';
import { findAllEducations, removeEducation } from '../../../services/education';
import { ConfigDataTable } from '../components/config-data-table';
import type { DataTableConfig } from '../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../components/config-data-table/data-table/columns/header';
import { DataTableRowActions } from '../components/config-data-table/data-table/columns/row-actions';
import { PageHeader } from '../components/PageHeader';
import EducationCreate from './Create';
import EducationUpdate from './Update';

interface EducationsProps<TData> {
	selectColShow?: boolean; // 是否显示选择列
	selectionHandler?: (rows: TData[]) => void; //储存选中状态到store
	title?: string; // 页面标题
	description?: string; // 页面描述
	mainTable?: boolean; // 是否为主表格
	collapsible?: boolean; // 是否为折叠组件
}

const Educations: React.FC<EducationsProps<EducationVO>> = ({
	selectColShow,
	selectionHandler,
	title,
	description,
	mainTable = true,
	collapsible = false
}) => {
	const { data, status } = useCustomQuery([EducationQueryKey.Educations], () =>
		findAllEducations()
	);
	const queryClient = useQueryClient();
	const removeMutation = useCustomMutation(removeEducation, {
		onSuccess: () => {
			toast.success('删除成功');
			queryClient.invalidateQueries({ queryKey: [EducationQueryKey.Educations] });
		},
		onError: () => {
			toast.error('删除失败');
		}
	});

	const navigate = useNavigate();

	if (status === 'pending') return <div></div>;
	if (status === 'error') return <div>错误:{data?.message}</div>;

	const eduData = data.data;

	const selectCol = selectColShow
		? [
				{
					id: '_select' as const,
					header: ({ table }: { table: Table<EducationVO> }) => (
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
					cell: ({ row }: { row: Row<EducationVO> }) => (
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

	const dataTableConfig: DataTableConfig<EducationVO> = {
		columns: {
			dataCols: [
				{
					accessorKey: 'school',
					header: ({ column }) => <DataTableColumnHeader column={column} title="学校" />,
					cell: ({ row }) => <div className="w-[160px] font-medium">{row.original.school}</div>,
					enableHiding: false,
					enableSorting: false
				},
				{
					accessorKey: 'major',
					header: ({ column }) => <DataTableColumnHeader column={column} title="专业" />,
					enableSorting: false
				},
				{
					accessorKey: 'degree',
					header: ({ column }) => <DataTableColumnHeader column={column} title="学历" />,
					enableSorting: false
				},
				{
					accessorKey: 'startDate',
					header: ({ column }) => <DataTableColumnHeader column={column} title="入学日期" />,
					cell: ({ row }) => <div>{row.original.startDate?.slice(0, 10)}</div>
				},
				{
					accessorKey: 'endDate',
					header: ({ column }) => <DataTableColumnHeader column={column} title="毕业日期" />,
					cell: ({ row }) => <div>{row.original.endDate?.slice(0, 10) || '-'}</div>
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
									component: <EducationUpdate id={row.original.id} />
								}
							]}
						/>
					)
				}
			]
		},
		options: {
			toolbar: { enable: true, searchColIds: ['school', 'major'] },
			pagination: { enable: eduData.length > 10 }
		},
		onRowClick: (rowData: EducationVO) => () => {
			navigate(`education-detail/${rowData?.id}`, {
				state: { param: rowData.id }
			});
		},
		createBtn: <EducationCreate />,
		selectionHandler,
		mainTable
	};

	return (
		<>
			{!collapsible && (
				<PageHeader title={title ?? '教育经历'} description={description ?? '管理你的教育经历'} />
			)}
			<div className="pl-10 pr-10">
				<ConfigDataTable dataTableConfig={dataTableConfig} data={eduData} />
			</div>
		</>
	);
};

export default Educations;
