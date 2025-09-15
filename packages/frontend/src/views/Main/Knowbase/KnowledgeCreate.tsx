import React from 'react';
import { DialogBtn } from '../components/DialogBtn';
import { KnowledgeForm } from './KnowledgeForm';

interface KnowledgeCreateProps {
	_?: string;
}

const KnowledgeCreate: React.FC<KnowledgeCreateProps> = () => {
	const dialogContent = (
		<>
			<div className="w-full p-7  overflow-y-auto max-h-[min(80vh,800px)] scb-thin">
				<KnowledgeForm></KnowledgeForm>
			</div>
		</>
	);

	return (
		<DialogBtn title={'添加知识'} description="添加您的专业知识">
			{dialogContent}
		</DialogBtn>
	);
};

export default KnowledgeCreate;
