import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { type PropsWithChildren } from 'react';

type ClickCollapsibleProps = PropsWithChildren<{
	defaultOpen?: boolean;
	title?: string | React.ReactNode;
	icon?: React.ReactNode;
	className?: string;
}>;

export default function ClickCollapsible({
	children,
	defaultOpen = true,
	title,
	icon,
	className
}: ClickCollapsibleProps) {
	return (
		<Collapsible
			defaultOpen={defaultOpen}
			className={cn('group/collapsible flex flex-col w-full items-start gap-2', className)}
		>
			<CollapsibleTrigger asChild>
				<div className={`flex items-center w-full ${title ? 'justify-between' : 'justify-end'}`}>
					<div className="flex items-center gap-2">
						{icon && icon}
						{title && <span className="text-sm font-medium">{title}</span>}
					</div>

					<Button variant="ghost" size="icon" className="size-8 shrink-0">
						<ChevronRight className="size-5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
					</Button>
				</div>
			</CollapsibleTrigger>
			<CollapsibleContent className="w-full">{children}</CollapsibleContent>
		</Collapsible>
	);
}
