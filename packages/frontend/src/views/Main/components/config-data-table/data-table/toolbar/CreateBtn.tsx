import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import type { PropsWithChildren } from 'react';
type Props = PropsWithChildren<{
	title?: string;
	description?: string;
	children?: React.ReactNode;
}>;
export function CreateBtn(props: Props) {
	const { title, description, children } = props;
	return (
		<Dialog>
			<DialogTrigger asChild>
				<div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
					<button
						type="button"
						className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 min-w-25"
					>
						新建
					</button>
				</div>
			</DialogTrigger>
			<DialogContent className="max-w-400! w-fit overflow-y-auto max-h-[100vh] gap-0">
				<DialogHeader className="border-b-1 ">
					<DialogTitle className="pb-5">{title}</DialogTitle>
					{/* <DialogDescription>{description}</DialogDescription> */}
				</DialogHeader>
				{children}
				{/* <DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button type="submit">Save changes</Button>
				</DialogFooter> */}
			</DialogContent>
		</Dialog>
	);
}
