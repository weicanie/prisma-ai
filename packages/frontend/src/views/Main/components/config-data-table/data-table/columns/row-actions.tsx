import { type Row } from '@tanstack/react-table';
import { EllipsisVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface DataTableRowActionsProps<TData> {
	row: Row<TData>;
	//自定义的行操作
	actions?: {
		label?: string;
		onClick?: (row: TData) => void;
		component?: React.ReactNode; // 作为组件代替默认的按钮
	}[];
}
/* 数据行的操作选项,单独作为一列 */
export function DataTableRowActions<TData>({ row, actions }: DataTableRowActionsProps<TData>) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
					<EllipsisVertical />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="flex justify-center flex-col items-center gap-y-2"
			>
				{/* <DropdownMenuItem>编辑</DropdownMenuItem> */}
				{/* <DropdownMenuSub>
					<DropdownMenuSubTrigger>编辑标签</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuRadioGroup value={'a'}>
							{['a', 'b', 'c'].map(label => (
								<DropdownMenuRadioItem key={label} value={label}>
									{label}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuSubContent>
				</DropdownMenuSub> */}
				{actions?.map(action => (
					<div
						key={action.label}
						onClick={e => {
							//防止触发跳转详情页
							e.stopPropagation();
							action.onClick?.(row.original);
						}}
					>
						{action.component ? (
							action.component
						) : (
							<button
								type="button"
								className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 min-w-25"
							>
								{action.label || '新建'}
							</button>
						)}
					</div>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
