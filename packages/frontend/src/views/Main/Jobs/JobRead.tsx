import React from 'react';
import { useParams } from 'react-router-dom';
import { useCustomQuery } from '../../../query/config';
import { JobQueryKey } from '../../../query/keys';
import { findAllUserJobs } from '../../../services/job';
import JobCard from './JobCard';

interface JobReadProps {
	_?: string;
}

const JobRead: React.FC<JobReadProps> = () => {
	const { jobId } = useParams();
	const { data, status } = useCustomQuery([JobQueryKey.Jobs], () => findAllUserJobs(1, 1000));

	if (status === 'pending') {
		return <div>Loading...</div>;
	}
	if (status === 'error') {
		return <div>错误:{data?.message}</div>;
	}
	const jobDatas = data.data?.data || [];
	const jobData = jobDatas?.find(job => job.id === jobId);

	if (!jobData || jobId === undefined) {
		return <div className="text-center text-gray-500">没有找到岗位数据</div>;
	}

	return <JobCard jobData={jobData} />;
};

export default JobRead;
