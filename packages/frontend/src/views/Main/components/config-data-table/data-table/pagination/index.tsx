import { type Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { useEffect, useRef } from 'react';
import { useIsMobile } from '../../../../../../hooks/use-mobile';
import type { DataTableConfig } from '../../config.type';

interface DataTablePaginationProps<TData> {
	table: Table<TData>;
	options: DataTableConfig<TData>['options']['pagination'];
}

export function DataTablePagination<TData>({ table, options }: DataTablePaginationProps<TData>) {
	const {
		showSizeChanger = true,
		pageSize = 10,
		pageSizeOptions = [10],
		setPageSize,
		pageIndex = 0,
		setPageIndex,
		handleNextPageHover
	} = options;

	const timerRef = useRef<{ timer: ReturnType<typeof setInterval> | null }>({ timer: null });
	//为了预取回调始终获取到最新的pageIndex（避免闭包问题，始终预取最新页的下一页）
	const pageIndexRef = useRef(pageIndex);

	useEffect(() => {
		pageIndexRef.current = pageIndex;
	}, [pageIndex]);

	const isMobile = useIsMobile();

	return (
		<div
			className="flex items-center justify-center px-2"
			// 使用定时器支持连续点击下始终预加载最新页的下一页
			onMouseEnter={() => {
				// 设置定时器持续触发
				const timer = setInterval(() => {
					handleNextPageHover?.(pageIndexRef.current);
				}, 100);

				// 存储定时器ID，在onMouseLeave时清除
				timerRef.current.timer = timer;
			}}
			onMouseLeave={() => {
				// 清除定时器
				if (timerRef.current.timer) {
					clearInterval(timerRef.current.timer);
					timerRef.current.timer = null;
				}
			}}
		>
			{/* <div className="flex-1 text-sm text-muted-foreground">
				{table.getFilteredSelectedRowModel().rows.length} /{' '}
				{table.getFilteredRowModel().rows.length} 行被选中
			</div> */}
			<div className="flex items-center space-x-6 lg:space-x-8">
				{showSizeChanger && (
					<div className="flex items-center space-x-2">
						{!isMobile && <p className="text-sm font-medium">每页行数</p>}
						<Select
							//! 更新pageSize props不会更新 table.getState().pagination.pageSize
							// value={`${table.getState().pagination.pageSize}`}
							value={`${pageSize}`}
							onValueChange={value => {
								setPageSize?.(Number(value));
								table.setPageSize(Number(value));
							}}
						>
							<SelectTrigger className="h-8 min-w-[70px]">
								<SelectValue placeholder={table.getState().pagination.pageSize} />
							</SelectTrigger>
							<SelectContent side="top">
								{pageSizeOptions.map(pageSize => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
				{showSizeChanger && !isMobile && (
					<div className="flex items-center justify-center text-sm font-medium">
						共<p className="mx-1 font-semibold text-primary">{table.getRowCount()} </p>条
					</div>
				)}
				<div className="flex w-[100px] items-center justify-center text-sm font-medium">
					第
					<p className="mx-1 font-semibold text-primary">
						{pageIndex + 1}/{table.getPageCount()}
					</p>
					页
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => {
							setPageIndex?.(0);
						}}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to first page</span>
						<ChevronsLeft />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={() => {
							setPageIndex?.(pageIndex - 1);
						}}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to previous page</span>
						<ChevronLeft />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={() => {
							setPageIndex?.(pageIndex + 1);
						}}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to next page</span>
						<ChevronRight />
					</Button>
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => {
							setPageIndex?.(table.getPageCount() - 1);
						}}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to last page</span>
						<ChevronsRight />
					</Button>
				</div>
			</div>
		</div>
	);
}
