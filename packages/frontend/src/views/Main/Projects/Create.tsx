import { markdownToProjectSchema, projectSchema } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCustomMutation } from '../../../query/config';
import { ProjectQueryKey } from '../../../query/keys';
import { createProject } from '../../../services/project';
import { resetProjectData, selectProjectMd, setDataFromMd } from '../../../store/projects';
import { DialogBtn } from '../components/DialogBtn';
import MilkdownEditor from '../components/Editor';
import ProjectForm from './ProjectForm';

interface CreateProjectProps {
	_?: string;
}

const CreateProject: React.FC<CreateProjectProps> = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const uploadProjectMutation = useCustomMutation(createProject, {
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ProjectQueryKey.Projects] });
			dispatch(resetProjectData()); // 重置表单
			toast.success('项目经验创建成功');
		},
		onError: error => {
			console.error('项目上传失败:', error);
			toast.error('项目经验创建失败');
		}
	});
	const [isUseMdEditor, setIsUseMdEditor] = React.useState(false);

	const editorProps = {
		submitHandler: (md: string) => () => {
			const project = markdownToProjectSchema(md);
			try {
				projectSchema.parse(project);
			} catch (error) {
				if (error instanceof z.ZodError) {
					toast.error('请检查项目经验语法是否有误');
					error.issues.forEach(issue => {
						toast.error(issue.message);
					});
				}
				return;
			}
			console.log('通过md编辑器提交的项目经验:', project);
			uploadProjectMutation.mutate(project);
		},
		updateAction: setDataFromMd,
		mdSelector: selectProjectMd,
		setIsUseMdEditor
	};
	const dialogContent = (
		<>
			<div className="flex gap-2 max-h-[80vh] overflow-y-auto scrollbar-hide">
				{!isUseMdEditor && (
					<div className="basis-120 h-full mt-10">
						<ProjectForm
							isUseMdEditor={isUseMdEditor}
							setIsUseMdEditor={setIsUseMdEditor}
						></ProjectForm>
					</div>
				)}
				{!isUseMdEditor && (
					<div className="h-full flex-1 overflow-auto scrollbar-hide bg-[rgb(242,242,242)] dark:bg-black ">
						<MilkdownEditor {...editorProps} type="show"></MilkdownEditor>
					</div>
				)}
				{isUseMdEditor && (
					<div className=" overflow-y-auto sm:w-[80vw] md:w-[60vw] scrollbar-hide">
						<MilkdownEditor {...editorProps} type="edit"></MilkdownEditor>
					</div>
				)}
			</div>
		</>
	);
	return (
		<>
			<DialogBtn title={'创建项目经验'} description="创建你的项目经验">
				{dialogContent}
			</DialogBtn>
		</>
	);
};

export default CreateProject;
