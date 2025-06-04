import { type Table } from '@tanstack/react-table';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { DataColWithFilter } from '../../config.type';
import { DataTableFacetedFilter } from './filter';
import { DataTableViewOptions } from './view-options';

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	filterDataCols?: DataColWithFilter<any>[];
	searchColId?: string; // 用于搜索的列ID
	createBtn?: React.ReactNode; //带创建弹窗的创建按钮
}

export function DataTableToolbar<TData>({
	table,
	filterDataCols,
	searchColId,
	createBtn
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
			{/* <DataTableViewOptions table={table} /> */}
			{/* 创建按钮 */}
			{createBtn ? createBtn : <DataTableViewOptions table={table} />}
		</div>
	);
}
