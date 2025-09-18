import React, { Suspense, lazy } from 'react';
import { DialogBtn } from '../components/DialogBtn';
const CareerForm = lazy(() => import('./Form'));

interface CareerCreateProps {
	_?: string;
}

const CareerCreate: React.FC<CareerCreateProps> = () => {
	const dialogContent = (
		<>
			<div className="w-full p-7  overflow-y-auto max-h-[min(80vh,800px)] scb-thin">
				<Suspense fallback={<div></div>}>
					<CareerForm />
				</Suspense>
			</div>
		</>
	);

	return (
		<DialogBtn title={'添加工作经历'} description="添加您的工作经历">
			{dialogContent}
		</DialogBtn>
	);
};

export default CareerCreate;
