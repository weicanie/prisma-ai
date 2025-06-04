import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { markdownToProjectSchema } from '@prism-ai/shared';
import React, { type PropsWithChildren } from 'react';
import { useCustomMutation } from '../../../query/config';
import { createProject } from '../../../services/project';
import { selectProjectMd, setDataFromMd } from '../../../store/projects';
import MilkdownEditor from '../components/Editor';
import { ProjectForm } from './ProjectForm';

//TODO 项目经验新建支持md编辑器、格式保护
//TODO支持项目经验上传, 支持上传文本（格式转换）和上传文件（提取文本,然后格式转换）

type CreateBtnProps = PropsWithChildren<{
	title?: string;
	description?: string;
	children?: React.ReactNode;
}>;

export function CreateBtn(props: CreateBtnProps) {
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
				{/* 弹窗内容 */}
				{children}
			</DialogContent>
		</Dialog>
	);
}

interface CreateProjectProps {}

export const CreateProject: React.FC<CreateProjectProps> = props => {
	const uploadProjectMutation = useCustomMutation(createProject);

	const editorProps = {
		type: 'show' as const,
		submitHandler: (md: string) => () => {
			const project = markdownToProjectSchema(md);
			console.log('提交的项目经验:', project);
			uploadProjectMutation.mutate(project);
		},
		UpdateAction: setDataFromMd,
		mdSelector: selectProjectMd
	};

	const dialogContent = (
		<>
			<div className="flex gap-2">
				<div className="basis-180 max-w-3xl mt-10">
					<ProjectForm></ProjectForm>
				</div>
				<div className="size-200 flex items-center justify-center bg-[rgb(242,242,242)] dark:bg-black ">
					<div className="w-9/10 h-9/10 flex-none overflow-y-auto flex items-center justify-center scrollbar-hide">
						<MilkdownEditor {...editorProps}></MilkdownEditor>
					</div>
				</div>
			</div>
		</>
	);
	return (
		<>
			<CreateBtn title={'创建项目经验'} description="创建你的项目经验">
				{dialogContent}
			</CreateBtn>
		</>
	);
};
