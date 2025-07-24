import { type Row } from '@tanstack/react-table';
import { EllipsisVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface DataTableRowActionsProps<TData> {
	row: Row<TData>;
	//自定义的行操作
	actions?: {
		label: string;
		onClick: (row: TData) => void;
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
			<DropdownMenuContent align="end" className="w-[160px]">
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
					<DropdownMenuItem
						key={action.label}
						onClick={e => {
							//防止触发跳转详情页
							e.stopPropagation();
							action.onClick(row.original);
						}}
					>
						{action.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
