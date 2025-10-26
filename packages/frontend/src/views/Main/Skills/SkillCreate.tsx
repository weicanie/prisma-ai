import { markdownToSkills, skillDtoSchema } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCustomMutation } from '../../../query/config';
import { SkillQueryKey } from '../../../query/keys';
import { createSkill } from '../../../services/skill';
import { selectSkillMd, setSkillDataFromMd } from '../../../store/skills';
import { DialogBtn } from '../components/DialogBtn';
import MilkdownEditor from '../components/Editor';
import SkillForm from './SkillForm';
interface SkillCreateProps {
	_?: string;
}

export const SkillCreate: React.FC<SkillCreateProps> = () => {
	const queryClient = useQueryClient();
	const uploadSkillMutation = useCustomMutation(createSkill, {
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [SkillQueryKey.Skills] });
			toast.success('职业技能创建成功');
		}
	});
	const [isUseMdEditor, setIsUseMdEditor] = React.useState(false);

	const editorProps = {
		submitHandler: (md: string) => () => {
			const skill = markdownToSkills(md);
			try {
				skillDtoSchema.parse(skill);
			} catch (error) {
				if (error instanceof z.ZodError) {
					toast.error('请检查技能清单语法是否有误');
					error.issues.forEach(issue => {
						toast.error(issue.message);
					});
				}
				return;
			}
			console.log('通过md编辑器提交的职业技能:', skill);
			uploadSkillMutation.mutate(skill);
		},
		updateAction: setSkillDataFromMd,
		mdSelector: selectSkillMd,
		setIsUseMdEditor
	};
	const dialogContent = (
		<>
			<div className="flex gap-2">
				{!isUseMdEditor && (
					<div className="basis-180 max-w-3xl mt-10 max-h-[calc(100vh-100px)] overflow-y-auto scb-thin">
						<SkillForm
							setIsUseMdEditor={setIsUseMdEditor}
							isUseMdEditor={isUseMdEditor}
						></SkillForm>
					</div>
				)}

				<div className="size-200 flex items-center justify-center bg-[rgb(242,242,242)] dark:bg-black ">
					<div
						className="w-9/10 h-9/10 flex-none overflow-y-auto flex items-center justify-center  scb-thin scrollbar-track-transparent scrollbar-thumb-gray-300 
                    hover:scrollbar-thumb-gray-400 
                    dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500
                    scrollbar-thumb-rounded-full"
					>
						{!isUseMdEditor && <MilkdownEditor {...editorProps} type="show"></MilkdownEditor>}
						{isUseMdEditor && <MilkdownEditor {...editorProps} type="edit"></MilkdownEditor>}
					</div>
				</div>
			</div>
		</>
	);

	return (
		<DialogBtn title={'创建职业技能'} description="添加您的专业技能">
			{dialogContent}
		</DialogBtn>
	);
};
