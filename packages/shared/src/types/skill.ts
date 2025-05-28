// 定义技能相关的 DTO 和 VO

export interface SkillItem {
	type?: string;

	content?: string[];
}

export interface CreateSkillDto {
	readonly content: SkillItem[];
}

export type UpdateSkillDto = Partial<CreateSkillDto>;

export interface SkillVo {
	_id: string;
	content: SkillItem[];

	createdAt?: string;
	updatedAt?: string;
}
