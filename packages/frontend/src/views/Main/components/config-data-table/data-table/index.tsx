import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type TableOptions,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable
} from '@tanstack/react-table';
import * as React from 'react';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import type { DataColWithFilter, DataTableConfig } from '../config.type';
import { DataTablePagination } from './pagination';
import { DataTableToolbar } from './toolbar';

type DataTableProps<TData, TValue> = Omit<DataTableConfig<TData>, 'columns'> & {
	columns: ColumnDef<TData, TValue>[]; // 列定义
	filterDataCols?: DataColWithFilter<TData>[]; // 支持过滤功能的列的定义
	data: TData[]; // 表格数据源
};

export function DataTable<TData, TValue = unknown>({
	columns,
	data,
	filterDataCols,
	options,
	onRowClick,
	createBtn,
	actionBtns = [],
	selectionHandler,
	mainTable = true
}: DataTableProps<TData, TValue>) {
	/* rowSelection的key储存当前选中行在data中的原始index, 其不随排序的变化而变化 */
	const [rowSelection, setRowSelection] = React.useState({});

	// 处理行选择变化事件
	React.useEffect(() => {
		if (selectionHandler) {
			selectionHandler(
				[...Object.getOwnPropertyNames(rowSelection)]
					.map((key: string) => parseInt(key))
					.map((index: number) => data[index])
			);
		}
	}, [rowSelection]);

	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = React.useState<SortingState>([]);

	const tableConfig: TableOptions<TData> = {
		data,
		columns,
		state: {
			rowSelection, // 行选择状态 - 跟踪哪些行被选中
			columnVisibility, // 列可见性状态 - 控制哪些列显示/隐藏
			columnFilters, // 列过滤状态 - 存储各列的过滤条件
			sorting // 排序状态 - 存储当前的排序规则（当前是按某列来排,复合排序需要额外配置）
		},
		manualPagination: options.pagination.manualPagination ?? false,
		rowCount: options.pagination.manualPagination ? (options.pagination.rowCount ?? 0) : undefined,
		autoResetPageIndex: options.pagination.manualPagination ?? true, //不管是否启用服务端分页，都自动重置页码
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		globalFilterFn: (row, _, filterValue) => {
			const searchColIds = options.toolbar.searchColIds;

			// 全局过滤函数, 用于搜索多列（searchColIds中任意列含有搜索值就显示）
			return searchColIds.some(colId => {
				const value = row.getValue(colId);
				return String(value?.toString().toLowerCase() ?? '').includes(filterValue.toLowerCase());
			});
		},
		getCoreRowModel: getCoreRowModel(), // 核心行模型 - 基础表格功能
		getFilteredRowModel: getFilteredRowModel(), // 过滤行模型 - 处理数据过滤
		getPaginationRowModel: getPaginationRowModel(), // 分页行模型 - 处理分页逻辑
		getSortedRowModel: getSortedRowModel(), // 排序行模型 - 处理数据排序
		getFacetedRowModel: getFacetedRowModel(), // 分面行模型 - 用于过滤器选项生成
		getFacetedUniqueValues: getFacetedUniqueValues() // 获取列的唯一值 - 用于过滤器选项
	};

	if (options.pagination.pageIndex !== undefined) {
		tableConfig.state!.pagination = {
			pageIndex: options.pagination.pageIndex ?? 0,
			pageSize: options.pagination.pageSize ?? 10
		};
	}

	const table = useReactTable(tableConfig);

	return (
		<div className="space-y-4 ">
			{/* toolbar */}
			{options.toolbar.enable && (
				<DataTableToolbar
					table={table}
					filterDataCols={filterDataCols}
					createBtn={createBtn}
					actionBtns={actionBtns}
					mainTable={mainTable}
					filterOptions={options.toolbar.filterOptions}
				/>
			)}
			{/* 表格 */}
			<div className="rounded-md border">
				<Table className="max-w-full overflow-x-auto scb-thin">
					<TableHeader>
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map(header => {
									return (
										<TableHead key={header.id} colSpan={header.colSpan}>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody className="scb-thin">
						{table.getRowModel().rows?.length ? (
							// 这里的index是当前页的index（0~pagesize-1）, 不是data中的index
							table.getRowModel().rows.map(row => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
									onClick={onRowClick ? onRowClick(row.original) : undefined}
									className="cursor-pointer hover:bg-muted/50"
								>
									{row.getVisibleCells().map(cell => (
										<TableCell
											key={cell.id}
											// 如果是选择列,防止点击checkbox后跳转详情页
											onClick={cell.id.includes('_select') ? e => e.stopPropagation() : undefined}
										>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									暂无数据
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{options.pagination.enable && (
				<DataTablePagination<TData> table={table} options={options.pagination} />
			)}
		</div>
	);
}
