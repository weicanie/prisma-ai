import { CreateKnowledgeDto, FileTypeEnum, KnowledgeTypeEnum } from '@prisma-ai/shared';

export class CreateKnowledgebaseDto implements CreateKnowledgeDto {
	name: string;
	fileType: FileTypeEnum;
	tag: string[];
	type: KnowledgeTypeEnum;
	content: string;
}
