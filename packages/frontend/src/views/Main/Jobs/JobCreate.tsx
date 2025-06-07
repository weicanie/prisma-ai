import React from 'react';
import { CreateBtn } from '../Projects/Create';
import { JobForm } from './JobForm';

interface JobCreateProps {
	_?: string;
}

const JobCreate: React.FC<JobCreateProps> = () => {
	const dialogContent = (
		<>
			<div className="flex gap-2">
				<div className="basis-180 max-w-3xl mt-10">
					<JobForm></JobForm>
				</div>
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
