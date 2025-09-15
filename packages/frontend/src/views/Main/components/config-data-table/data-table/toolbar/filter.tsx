import { type Column } from '@tanstack/react-table';
import { Check, Search } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useSelector } from 'react-redux';
import type { DataTableConfig } from '../../config.type';

interface DataTableFacetedFilterProps<TData, TValue> {
	column?: Column<TData, TValue>;
	title?: string;
	options: {
		label: string;
		value: string;
		icon?: React.ComponentType<{ className?: string }>;
	}[];
	filterOptions?: DataTableConfig['options']['toolbar']['filterOptions'];
}
/* 按值筛选 */
export function DataTableFacetedFilter<TData, TValue>({
	column,
	title,
	options,
	filterOptions
}: DataTableFacetedFilterProps<TData, TValue>) {
	const facets = column?.getFacetedUniqueValues();
	const selectedValueData: string[] = useSelector(
		filterOptions?.selectorGet(column?.id) ?? (() => new Set(column?.getFilterValue() as string[])) //兼容表格自己管理过滤值的情况
	);
	const selectedValues = new Set(selectedValueData);

	const deleteFilterValue = (value: string) => {
		//区分服务端筛选和客户端筛选
		if (filterOptions?.selectorSet) {
			selectedValues.delete(value);
			filterOptions?.selectorSet?.({
				columnId: column?.id ?? '',
				selectedFilterValues: Array.from(selectedValues)
			});
		} else {
			selectedValues.delete(value);
			const filterValues = Array.from(selectedValues);
			column?.setFilterValue(filterValues.length ? filterValues : undefined);
		}
	};

	const addFilterValue = (value: string) => {
		if (filterOptions?.selectorSet) {
			selectedValues.add(value);
			filterOptions?.selectorSet?.({
				columnId: column?.id ?? '',
				selectedFilterValues: Array.from(selectedValues)
			});
		} else {
			selectedValues.add(value);
			const filterValues = Array.from(selectedValues);
			column?.setFilterValue(filterValues.length ? filterValues : undefined);
		}
	};

	const clearFilter = () => {
		if (filterOptions?.selectorSet) {
			filterOptions?.selectorSet?.({
				columnId: column?.id ?? '',
				selectedFilterValues: []
			});
		} else {
			column?.setFilterValue(undefined);
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="h-8 border-dashed">
					<Search />
					{title}
					{selectedValues?.size > 0 && (
						<>
							<Separator orientation="vertical" className="mx-2 h-4" />
							<Badge variant="default" className="rounded-sm px-1 font-normal lg:hidden">
								{selectedValues.size}
							</Badge>
							<div className="hidden space-x-1 lg:flex">
								{options
									.filter(option => selectedValues.has(option.value))
									.slice(0, 1)
									.map(option => (
										<Badge
											variant="default"
											key={option.value}
											className="rounded-sm px-1 font-normal"
										>
											{option.label}
										</Badge>
									))
									.concat([
										selectedValues.size - 1 > 0 ? (
											<Badge variant="default" key={`more`} className="rounded-sm px-1 font-normal">
												+{selectedValues.size - 1}
											</Badge>
										) : (
											<></>
										)
									])}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
				<Command>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>暂无数据</CommandEmpty>
						<CommandGroup>
							{options.map(option => {
								const isSelected = selectedValues.has(option.value);
								return (
									<CommandItem
										key={option.value}
										onSelect={() => {
											if (isSelected) {
												deleteFilterValue(option.value);
											} else {
												addFilterValue(option.value);
											}
										}}
									>
										<div
											className={cn(
												'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
												isSelected
													? 'bg-primary text-primary-foreground'
													: 'opacity-50 [&_svg]:invisible'
											)}
										>
											<Check />
										</div>
										{option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
										<span>{option.label}</span>
										{/* 服务端筛选不显示客户端数量 */}
										{facets?.get(option.value) && !filterOptions?.selectorSet && (
											<span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
												{facets.get(option.value)}
											</span>
										)}
									</CommandItem>
								);
							})}
						</CommandGroup>
						{selectedValues.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => clearFilter()}
										className="justify-center text-center"
									>
										清除
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
