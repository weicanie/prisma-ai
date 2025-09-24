import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { memo, type PropsWithChildren, useState } from 'react';

type ClickCollapsibleProps = PropsWithChildren<{
	defaultOpen?: boolean;
	open?: boolean; //使用受控模式
	title?: string | React.ReactNode;
	icon?: React.ReactNode;
	className?: string;
	onClick?: (e: React.MouseEvent) => unknown;
	onMouseEnter?: () => unknown;
	onMouseLeave?: () => unknown;
	/* 是否在onMouseEnter时预渲染内容
	单独的ClickCollapsible时，enablePreload=true会提升性能
	嵌套的ClickCollapsible时，enablePreload=true反而会降低性能
	*/
	enablePreload?: boolean;
}>;

function ClickCollapsible({
	children,
	open,
	defaultOpen = true,
	title,
	icon,
	className,
	onClick,
	onMouseEnter,
	onMouseLeave,
	enablePreload = false
}: ClickCollapsibleProps) {
	const [preload, setPreload] = useState(false);

	// 处理鼠标进入事件
	const handleMouseEnter = () => {
		if (enablePreload && !preload) {
			setPreload(true);
		}
		onMouseEnter?.();
	};

	return (
		<>
			{/* 预渲染内容（隐藏） */}
			{enablePreload && preload && <div className="hidden">{children}</div>}

			<Collapsible
				defaultOpen={open ? undefined : defaultOpen}
				className={cn('group/collapsible flex flex-col w-full items-start gap-2', className)}
				open={open}
			>
				<CollapsibleTrigger asChild>
					<div
						className={`flex items-center w-full ${title ? 'justify-between' : 'justify-end'}`}
						onClick={e => onClick?.(e)}
						onMouseEnter={handleMouseEnter}
						onMouseLeave={() => onMouseLeave?.()}
					>
						<div className="flex items-center gap-2">
							{icon && icon}
							{title && <span className="text-sm font-medium">{title}</span>}
						</div>

						<Button variant="ghost" size="icon" className="size-8 shrink-0">
							<ChevronRight className="size-5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
						</Button>
					</div>
				</CollapsibleTrigger>

				{/* 正常展开的内容 */}
				<CollapsibleContent className="w-full">{children}</CollapsibleContent>
			</Collapsible>
		</>
	);
}
export default memo(ClickCollapsible);
