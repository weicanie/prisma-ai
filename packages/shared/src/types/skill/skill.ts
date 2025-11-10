// 定义技能相关的 DTO 和 VO

export interface SkillItem {
	type?: string;

	content?: string[];
}

export interface CreateSkillDto {
	name: string;
	content: SkillItem[];
}

export type UpdateSkillDto = Partial<CreateSkillDto>;

export interface SkillVo {
	id: string;
	name: string;
	content: SkillItem[];

	createdAt: string;
	updatedAt: string;
}
