import { markdownToSkills } from '@prism-ai/shared';
import React from 'react';
import { useCustomMutation } from '../../../query/config';
import { createSkill } from '../../../services/skill';
import { selectSkillMd, setSkillDataFromMd } from '../../../store/skills';
import { CreateBtn } from '../components/CreateBtn';
import MilkdownEditor from '../components/Editor';
import { SkillForm } from './SkillForm';

interface SkillCreateProps {
	_?: string;
}

export const SkillCreate: React.FC<SkillCreateProps> = () => {
	const uploadSkillMutation = useCustomMutation(createSkill);

	const editorProps = {
		type: 'show' as const,
		submitHandler: (md: string) => () => {
			const skill = markdownToSkills(md);
			console.log('通过md编辑器提交的职业技能:', skill);
			uploadSkillMutation.mutate(skill);
		},
		UpdateAction: setSkillDataFromMd,
		mdSelector: selectSkillMd
	};

	const dialogContent = (
		<>
			<div className="flex gap-2">
				<div className="basis-180 max-w-3xl mt-10 max-h-[calc(100vh-100px)] overflow-y-auto scb-thin">
					<SkillForm></SkillForm>
				</div>
				<div className="size-200 flex items-center justify-center bg-[rgb(242,242,242)] dark:bg-black ">
					<div
						className="w-9/10 h-9/10 flex-none overflow-y-auto flex items-center justify-center  scb-thin scrollbar-track-transparent scrollbar-thumb-gray-300 
                    hover:scrollbar-thumb-gray-400 
                    dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500
                    scrollbar-thumb-rounded-full"
					>
						<MilkdownEditor {...editorProps}></MilkdownEditor>
					</div>
				</div>
			</div>
		</>
	);

	return (
		<CreateBtn title={'创建职业技能'} description="添加您的专业技能">
			{dialogContent}
		</CreateBtn>
	);
};
