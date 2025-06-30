import { CreateKnowledgeDto, FileTypeEnum, KnowledgeTypeEnum } from '@prism-ai/shared';

export class CreateKnowledgebaseDto implements CreateKnowledgeDto {
	name: string;
	fileType: FileTypeEnum;
	tag: string[];
	type: KnowledgeTypeEnum;
	content: string;
}
