import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';
import { useCustomMutation } from '../../../query/config';
import { ResumeQueryKey } from '../../../query/keys';
import { createResume } from '../../../services/resume';
import { DialogBtn } from '../components/DialogBtn';
import ResumeForm from './ResumeForm';

interface ResumeCreateProps {
	_?: string;
}

const ResumeCreate: React.FC<ResumeCreateProps> = () => {
	const queryClient = useQueryClient();
	//TODO 分页参数不写死
	const createResumeMutation = useCustomMutation(createResume, {
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ResumeQueryKey.Resumes, 1, 1000] });
			toast.success('简历创建成功');
		},
		onError: error => {
			console.error('简历上传失败:', error);
			toast.error('简历创建失败');
		}
	});

	const dialogContent = (
		<div className="w-full flex justify-center items-center">
			<ResumeForm onSubmit={createResumeMutation.mutate} />
		</div>
	);

	return (
		<DialogBtn title={'创建简历'} description="创建一份新的个人简历">
			{dialogContent}
		</DialogBtn>
	);
};

export default ResumeCreate;
