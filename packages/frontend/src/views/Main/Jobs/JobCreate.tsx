import React from 'react';
import { CreateBtn } from '../components/CreateBtn';
import { JobForm } from './JobForm';

interface JobCreateProps {
	_?: string;
}

const JobCreate: React.FC<JobCreateProps> = () => {
	const dialogContent = (
		<>
			<div className="w-full p-7 ">
				<JobForm></JobForm>
			</div>
		</>
	);

	return (
		<CreateBtn title={'创建岗位'} description="添加您关注的职位信息">
			{dialogContent}
		</CreateBtn>
	);
};

export default JobCreate;
