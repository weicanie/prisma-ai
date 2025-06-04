import { CreateKnowledgeDto } from '@prism-ai/shared';

export class CreateKnowledgebaseDto implements CreateKnowledgeDto {
	name: string;
	fileType: string;
	tag: string[];
	type: string;
	content: string;
}
