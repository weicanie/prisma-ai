import React, { Suspense } from 'react';
import { DialogBtn } from '../components/DialogBtn';
import ProjectForm from './ProjectForm';

interface ProjectUpdateProps {
	_?: string;
	id: string;
}

const ProjectUpdate: React.FC<ProjectUpdateProps> = ({ id }) => {
	const dialogContent = (
		<>
			<div className="w-full p-7  overflow-y-auto max-h-[min(80vh,800px)] scb-thin">
				<Suspense fallback={<div></div>}>
					<ProjectForm id={id} isUseMdEditor={false} setIsUseMdEditor={() => {}} />
				</Suspense>
			</div>
		</>
	);

	return (
		<DialogBtn title={'编辑项目经验'} description="编辑您的项目经验" label="编辑">
			{dialogContent}
		</DialogBtn>
	);
};

export default ProjectUpdate;
