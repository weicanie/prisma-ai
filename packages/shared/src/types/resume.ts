// 定义简历相关的 DTO 和 VO

import { z } from 'zod';
import type { projectSchema } from '../index';
import type { SkillVo } from './skill';

/**
 * 创建简历的 DTO
 */
export interface CreateResumeDto {
	readonly name: string; // 简历名称
	readonly skills?: string[]; // 关联的技能ID列表
	readonly projects?: string[]; // 关联的项目经验ID列表
}

/**
 * 更新简历的 DTO
 */
export type UpdateResumeDto = Partial<CreateResumeDto>;

/**
 * 简历的 VO (View Object)
 * 用于API响应和前端展示
 */
export interface ResumeVo {
	id?: string; // 数据库中的ID

	name: string;
	skill: SkillVo; // 关联的技能详细信息 (populated)
	projects: z.infer<typeof projectSchema>[]; // 关联的项目经验详细信息 (populated)

	createdAt?: string; // 创建时间
	updatedAt?: string; // 最后更新时间
}

/**
 * 分页后的简历列表结果
 */
export interface PaginatedResumesResult {
	data: ResumeVo[]; // 当前页的简历数据
	total: number; // 总记录数
	page: number; // 当前页码
	limit: number; // 每页数量
}
