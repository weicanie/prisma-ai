import React, { Suspense, lazy } from 'react';
import { DialogBtn } from '../components/DialogBtn';
const UserMemoryForm = lazy(() => import('./Form'));

interface UserMemoryUpdateProps {
	_?: string;
}

const UserMemoryUpdate: React.FC<UserMemoryUpdateProps> = () => {
	const dialogContent = (
		<>
			<div className="w-full p-7 overflow-y-auto max-h-[min(80vh,800px)] scb-thin">
				<Suspense fallback={<div className="p-4">加载中...</div>}>
					<UserMemoryForm />
				</Suspense>
			</div>
		</>
	);

	return (
		<DialogBtn title={'编辑用户记忆'} description="编辑您的用户画像和求职方向" label="编辑">
			{dialogContent}
		</DialogBtn>
	);
};

export default UserMemoryUpdate;
