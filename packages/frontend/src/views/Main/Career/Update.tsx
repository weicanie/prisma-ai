import React, { Suspense, lazy } from 'react';
import { DialogBtn } from '../components/DialogBtn';
const CareerForm = lazy(() => import('./Form'));

interface CareerUpdateProps {
	_?: string;
	id: string;
}

const CareerUpdate: React.FC<CareerUpdateProps> = ({ id }) => {
	const dialogContent = (
		<>
			<div className="w-full p-7  overflow-y-auto max-h-[min(80vh,800px)] scb-thin">
				<Suspense fallback={<div></div>}>
					<CareerForm id={id} />
				</Suspense>
			</div>
		</>
	);

	return (
		<DialogBtn title={'编辑工作经历'} description="编辑您的工作经历" label="编辑">
			{dialogContent}
		</DialogBtn>
	);
};

export default CareerUpdate;
