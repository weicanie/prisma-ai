import { type Table } from '@tanstack/react-table';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import MilkdownEditor from '../../../Editor';
import { ProjectForm } from '../../../ProjectForm';
import type { DataColWithFilter } from '../../config.type';
import { CreateBtn } from './CreateBtn';
import { DataTableFacetedFilter } from './filter';

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	filterDataCols?: DataColWithFilter<any>[];
	searchColId?: string; // 用于搜索的列ID
}

export function DataTableToolbar<TData>({
	table,
	filterDataCols,
	searchColId
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
			<CreateBtn title={'创建项目经验'} description="创建你的项目经验">
				<div className="flex gap-2">
					<div className="basis-180 max-w-3xl mt-10">
						<ProjectForm></ProjectForm>
					</div>
					<div className="size-200 flex items-center justify-center bg-zinc-400">
						<div className="w-130 h-180 flex-none overflow-y-auto">
							<MilkdownEditor type={'show'}></MilkdownEditor>
						</div>
					</div>
				</div>
			</CreateBtn>
		</div>
	);
}
