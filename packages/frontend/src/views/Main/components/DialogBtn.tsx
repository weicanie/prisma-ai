import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import type { PropsWithChildren } from 'react';

type DialogBtnProps = PropsWithChildren<{
	title?: string;
	description?: string;
	label?: string;
}>;
/**
 * 按钮，点击后弹出弹窗，点击弹窗外或者'X'关闭
 */
export function DialogBtn(props: DialogBtnProps) {
	const { title, children, label } = props;
	return (
		<Dialog>
			<DialogTrigger asChild>
				<div className="sm:flex-none">
					<button
						type="button"
						className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 min-w-25"
					>
						{label || '新建'}
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
