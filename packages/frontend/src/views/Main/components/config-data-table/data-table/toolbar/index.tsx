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
	createBtn?: React.ReactNode; //带创建弹窗的创建按钮
	actionBtns?: {
		label: string;
		onClick: (row: TData, rowSelected: TData[]) => void; // 点击按钮时，传入当前行和选中的行
	}[];
	mainTable?: boolean; //是否为主表格,非主表格不展示新建按钮
}

export function DataTableToolbar<TData>({
	table,
	filterDataCols,
	createBtn,
	actionBtns = [],
	mainTable = true
}: DataTableToolbarProps<TData>) {
	const isFiltered = table.getState().columnFilters.length > 0;
	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				{/* 搜索栏 */}
				<Input
					placeholder="搜索..."
					onChange={event => table.setGlobalFilter(event.target.value)}
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
			{actionBtns.map(btn => (
				<Button
					key={btn.label}
					onClick={e => {
						e.stopPropagation();
						btn.onClick(
							table.getSelectedRowModel().rows[0].original,
							table.getSelectedRowModel().rows.map(row => row.original)
						);
					}}
					className="block rounded-md bg-secondary px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 min-w-25 transition-colors duration-200"
				>
					{btn.label}
				</Button>
			))}
			{/* 创建按钮 */}
			{mainTable && createBtn && createBtn}
			{/* 不传入按钮且为主表格时显示视图选项 */}
			{mainTable && !createBtn && actionBtns.length === 0 && <DataTableViewOptions table={table} />}
		</div>
	);
}
