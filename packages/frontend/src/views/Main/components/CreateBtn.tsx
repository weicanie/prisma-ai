import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import type { PropsWithChildren } from 'react';

type CreateBtnProps = PropsWithChildren<{
	title?: string;
	description?: string;
	children?: React.ReactNode;
}>;

export function CreateBtn(props: CreateBtnProps) {
	const { title, children } = props;
	return (
		<Dialog>
			<DialogTrigger asChild>
				<div className="sm:ml-16 sm:flex-none">
					<button
						type="button"
						className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 min-w-25"
					>
						新建
					</button>
				</div>
			</DialogTrigger>
			<DialogContent className="max-w-260! overflow-hidden max-h-[100vh] gap-0">
				<DialogHeader className="border-b-1 ">
					<DialogTitle className="pb-5">{title}</DialogTitle>
					{/* <DialogDescription>{description}</DialogDescription> */}
				</DialogHeader>
				{/* 弹窗内容 */}
				{children}
			</DialogContent>
		</Dialog>
	);
}
