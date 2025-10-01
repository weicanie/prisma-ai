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
				description="管理您的个人画像和求职方向，基于MECE原则设计的结构化信息"
			>
				<UserMemoryUpdate />
			</PageHeader>
			<div className="pl-10 pr-10">
				<UserMemoryRead />
			</div>
		</>
	);
};

export default UserMemory;
