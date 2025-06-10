import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useCustomMutation } from '../../../query/config';
import { ResumeQueryKey } from '../../../query/keys';
import { createResume } from '../../../services/resume';
import { CreateBtn } from '../components/CreateBtn';
import ResumeForm from './ResumeForm';

interface ResumeCreateProps {
	_?: string;
}

const ResumeCreate: React.FC<ResumeCreateProps> = () => {
	const queryClient = useQueryClient();
	//TODO 分页参数不写死
	const createResumeMutation = useCustomMutation(createResume, {
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ResumeQueryKey.Resumes, 1, 10] });
		}
	});

	const dialogContent = (
		<div className="w-full flex justify-center items-center">
			<ResumeForm onSubmit={createResumeMutation.mutate} />
		</div>
	);

	return (
		<CreateBtn title={'创建简历'} description="创建一份新的个人简历">
			{dialogContent}
		</CreateBtn>
	);
};

export default ResumeCreate;
