import { SkillItem } from '@prisma-ai/shared';
export class CreateSkillDto {
	readonly name: string;
	readonly content: SkillItem[];
}
