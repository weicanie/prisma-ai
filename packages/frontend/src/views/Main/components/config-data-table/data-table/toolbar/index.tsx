import { type Table } from '@tanstack/react-table';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { DataColWithFilter } from '../../config.type';
import { DataTableFacetedFilter } from './filter';
import { DataTableViewOptions } from './view-options';

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	filterDataCols?: DataColWithFilter<TData>[];
	searchColId?: string; // 用于搜索的列ID
	createBtn?: React.ReactNode; //带创建弹窗的创建按钮
	actionBtn?: React.ReactNode; //点击后跳转到操作页面或者弹出操作弹窗的按钮
	mainTable?: boolean; //是否为主表格,非主表格不展示新建按钮
}

export function DataTableToolbar<TData>({
	table,
	filterDataCols,
	searchColId,
	createBtn,
	actionBtn,
	mainTable = true
}: DataTableToolbarProps<TData>) {
	const isFiltered = table.getState().columnFilters.length > 0;
	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				{/* 搜索栏 */}
				<Input
					placeholder="搜索..."
					value={(table.getColumn(searchColId!)?.getFilterValue() as string) ?? ''}
					onChange={event => table.getColumn(searchColId!)?.setFilterValue(event.target.value)}
					className="h-8 w-[150px] lg:w-[250px]"
				/>
				{/* 按列值筛选 */}
				{filterDataCols?.map(col => {
					return (
						<DataTableFacetedFilter
							key={col.columnId}
							column={table.getColumn(col.columnId!)}
							title={col.title}
							options={col.options!}
						/>
					);
				})}
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => table.resetColumnFilters()}
						className="h-8 px-2 lg:px-3"
					>
						重置
						<X />
					</Button>
				)}
			</div>
			{/* 操作按钮 */}
			{actionBtn && actionBtn}
			{/* 创建按钮 */}
			{mainTable && createBtn && createBtn}
			{/* 不传入按钮时显示视图选项 */}
			{mainTable && !createBtn && !actionBtn && <DataTableViewOptions table={table} />}
		</div>
	);
}
