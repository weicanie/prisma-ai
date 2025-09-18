import React, { Suspense, lazy } from 'react';
import { DialogBtn } from '../components/DialogBtn';
const EducationForm = lazy(() => import('./Form'));

interface EducationUpdateProps {
	_?: string;
	id: string;
}

const EducationUpdate: React.FC<EducationUpdateProps> = ({ id }) => {
	const dialogContent = (
		<>
			<div className="w-full p-7  overflow-y-auto max-h-[min(80vh,800px)] scb-thin">
				<Suspense fallback={<div></div>}>
					<EducationForm id={id} />
				</Suspense>
			</div>
		</>
	);

	return (
		<DialogBtn title={'编辑职业技能'} description="编辑您的职业技能" label="编辑">
			{dialogContent}
		</DialogBtn>
	);
};

export default EducationUpdate;
