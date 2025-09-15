import React from 'react';
import { DialogBtn } from '../components/DialogBtn';
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
		<DialogBtn title={'创建岗位'} description="添加您关注的职位信息">
			{dialogContent}
		</DialogBtn>
	);
};

export default JobCreate;
