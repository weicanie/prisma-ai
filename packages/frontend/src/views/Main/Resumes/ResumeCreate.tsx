import React from 'react';
import { useCustomMutation } from '../../../query/config';
import { createResume } from '../../../services/resume';
import { CreateBtn } from '../Projects/Create';
import ResumeForm from './ResumeForm';

interface ResumeCreateProps {
	_?: string;
}

const ResumeCreate: React.FC<ResumeCreateProps> = () => {
	const createResumeMutation = useCustomMutation(createResume);

	const dialogContent = (
		<div className="flex justify-center items-center max-w-2xl">
			<div className="w-full">
				<ResumeForm onSubmit={createResumeMutation.mutate} />
			</div>
		</div>
	);

	return (
		<CreateBtn title={'创建简历'} description="创建一份新的个人简历">
			{dialogContent}
		</CreateBtn>
	);
};

export default ResumeCreate;
