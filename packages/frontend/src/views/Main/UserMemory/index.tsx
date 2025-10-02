import React from 'react';
import { PageHeader } from '../components/PageHeader';
import UserMemoryRead from './Read';
import UserMemoryUpdate from './Update';

interface UserMemoryProps {
	_?: string;
}

const UserMemory: React.FC<UserMemoryProps> = () => {
	return (
		<>
			<PageHeader
				title="用户记忆"
				description="Prisma知道的你: 根据你提供的职业技能、项目经验、工作经历、教育经历以及追踪的岗位等信息，自动生成对你的记忆"
			>
				<UserMemoryUpdate />
			</PageHeader>
			<div className="max-h-[calc(100vh-250px)] overflow-auto scb-thin pl-10 pr-10">
				<UserMemoryRead />
			</div>
		</>
	);
};

export default UserMemory;
