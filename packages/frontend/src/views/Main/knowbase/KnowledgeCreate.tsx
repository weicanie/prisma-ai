import React from 'react';
import { CreateBtn } from '../Projects/Create';
import { KnowledgeForm } from './KnowledgeForm';

interface KnowledgeCreateProps {}

export const KnowledgeCreate: React.FC<KnowledgeCreateProps> = props => {
	const dialogContent = (
		<>
			<div className="flex gap-2">
				<div className="basis-180 max-w-3xl mt-10">
					<KnowledgeForm></KnowledgeForm>
				</div>
			</div>
		</>
	);

	return (
		<CreateBtn title={'创建知识库'} description="添加您的专业知识">
			{dialogContent}
		</CreateBtn>
	);
};
