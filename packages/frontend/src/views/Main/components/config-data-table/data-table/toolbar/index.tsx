import { type Table } from '@tanstack/react-table';
import { Filter, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { useIsMobile } from '../../../../../../hooks/use-mobile';
import type { DataColWithFilter, DataTableConfig } from '../../config.type';
import { DataTableFacetedFilter } from './filter';
import { DataTableViewOptions } from './view-options';

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	filterDataCols?: DataColWithFilter<TData>[];
	createBtn?: React.ReactNode; //带创建弹窗的创建按钮
	actionBtns?: DataTableConfig<TData>['actionBtns'];
	mainTable?: boolean; //是否为主表格,非主表格不展示新建按钮
	filterOptions?: DataTableConfig['options']['toolbar']['filterOptions'];
}

export function DataTableToolbar<TData>({
	table,
	filterDataCols,
	createBtn,
	actionBtns = [],
	mainTable = true,
	filterOptions
}: DataTableToolbarProps<TData>) {
	const isFiltered = table.getState().columnFilters.length > 0;
	const isMobile = useIsMobile();
	if (isMobile) {
		//当为移动端时，筛选按钮和操作按钮都放到一个Popover下拉列表中，点击后弹出
		return (
			<>
				<div className="flex items-center justify-between gap-x-1">
					<div className="flex flex-1 items-center space-x-2">
						{/* 搜索栏 */}
						<Input
							placeholder="搜索..."
							onChange={event => table.setGlobalFilter(event.target.value)}
							className="h-8 lg:w-[250px] mr-2"
						/>
						{/* 筛选栏 */}
						<Popover>
							<PopoverTrigger asChild>
								<div className="w-12 h-8 mr-2 flex items-center justify-center rounded-md border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50">
									<Filter className="size-3" />
								</div>
							</PopoverTrigger>
							<PopoverContent className="flex h-8 flex-col mt-3  gap-2 bg-global z-1">
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
							</PopoverContent>
						</Popover>
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
					{actionBtns.map(btn =>
						btn.component ? (
							btn.component
						) : (
							<Button
								key={btn.label}
								onClick={e => {
									e.stopPropagation();
									btn.onClick?.(
										table.getSelectedRowModel().rows[0].original,
										table.getSelectedRowModel().rows.map(row => row.original)
									);
								}}
								className="block rounded-md bg-secondary px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 min-w-25 transition-colors duration-200"
							>
								{btn.label}
							</Button>
						)
					)}
					{/* 创建按钮 */}
					{mainTable && createBtn && createBtn}
					{/* 不传入按钮且为主表格时显示视图选项 */}
					{mainTable && !createBtn && actionBtns.length === 0 && (
						<DataTableViewOptions table={table} />
					)}
				</div>
			</>
		);
	}
	return (
		<div className="flex items-center justify-between gap-x-3">
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
							filterOptions={filterOptions}
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
			{actionBtns.map(btn =>
				btn.component ? (
					btn.component
				) : (
					<Button
						key={btn.label}
						onClick={e => {
							e.stopPropagation();
							btn.onClick?.(
								table.getSelectedRowModel().rows[0].original,
								table.getSelectedRowModel().rows.map(row => row.original)
							);
						}}
						className="block rounded-md bg-secondary px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 min-w-25 transition-colors duration-200"
					>
						{btn.label}
					</Button>
				)
			)}
			{/* 创建按钮 */}
			{mainTable && createBtn && createBtn}
			{/* 不传入按钮且为主表格时显示视图选项 */}
			{mainTable && !createBtn && actionBtns.length === 0 && <DataTableViewOptions table={table} />}
		</div>
	);
}
