import React, { Suspense } from 'react';
import { DialogBtn } from '../components/DialogBtn';
import SkillForm from './SkillForm';

interface SkillUpdateProps {
	_?: string;
	id: string;
}

const SkillUpdate: React.FC<SkillUpdateProps> = ({ id }) => {
	const dialogContent = (
		<>
			<div className="w-full p-7  overflow-y-auto max-h-[min(80vh,800px)] scb-thin">
				<Suspense fallback={<div></div>}>
					<SkillForm id={id} />
				</Suspense>
			</div>
		</>
	);

	return (
		<DialogBtn title={'编辑教育经历'} description="编辑您的教育经历" label="编辑">
			{dialogContent}
		</DialogBtn>
	);
};

export default SkillUpdate;
