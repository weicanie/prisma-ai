import React, { Suspense, lazy } from 'react';
import { DialogBtn } from '../components/DialogBtn';
const EducationForm = lazy(() => import('./Form'));

interface EducationCreateProps {
	_?: string;
}

const EducationCreate: React.FC<EducationCreateProps> = () => {
	const dialogContent = (
		<>
			<div className="w-full p-7  overflow-y-auto max-h-[min(80vh,800px)] scb-thin">
				<Suspense fallback={<div></div>}>
					<EducationForm />
				</Suspense>
			</div>
		</>
	);

	return (
		<DialogBtn title={'添加教育经历'} description="添加您的教育经历">
			{dialogContent}
		</DialogBtn>
	);
};

export default EducationCreate;
