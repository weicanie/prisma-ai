import { CreateProjectKnowledgeDto, FileTypeEnum, ProjectKnowledgeTypeEnum } from '@prisma-ai/shared';

export class CreateKnowledgebaseDto implements CreateProjectKnowledgeDto {
	name: string;
	projectName: string;
	fileType: FileTypeEnum;
	tag: string[];
	type: ProjectKnowledgeTypeEnum;
	content: string;
}
