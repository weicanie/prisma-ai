// 定义简历相关的 DTO 和 VO

import { z } from 'zod';
import { CareerVO, UpdateCareerDto } from './career/career';
import { EducationVO, UpdateEducationDto } from './education/education';
import { JobVo } from './job';
import { ProjectVo, updateProjectDto } from './project';
import { resumeMatchedSchema } from './resume.schema';
import { SkillVo, UpdateSkillDto } from './skill';
export enum ResumeStatus {
	committed = 'committed', //初提交
	matched = 'matched' //用户已合并匹配
}

/**
 * 创建简历的 DTO
 */
export interface CreateResumeDto {
	name: string; // 简历名称
	skill?: string; // 关联的技能ID
	projects?: string[]; // 关联的项目经验ID列表
	careers?: string[]; // 关联的工作经历ID列表
	educations?: string[]; // 关联的教育经历ID列表
}

/**
 * 更新简历的 DTO
 */
export type UpdateResumeDto = Partial<CreateResumeDto>;

/**
 * 更新简历内容的 DTO
 */
export type UpdateResumeContentDto = {
	name: string; // 简历名称
	skill?: UpdateSkillDto & { id: string }; // 关联的技能
	projects?: (updateProjectDto & { id: string })[]; // 关联的项目经验列表
	careers?: (UpdateCareerDto & { id: string })[]; // 关联的工作经历列表
	educations?: (UpdateEducationDto & { id: string })[]; // 关联的教育经历列表
};

/**
 * 简历匹配岗位前端上传的 DTO
 */
export interface MatchJobDto {
	resume: string; // 简历的id
	job: string; // 岗位的id
}
/**
 * 简历匹配岗位传入chain的 DTO
 */
export type ResumeMatchedDto = z.infer<typeof resumeMatchedSchema>;
/**
 * 简历的 VO (View Object)
 * 用于API响应和前端展示
 */
export interface ResumeVo {
	id: string; // 数据库中的ID
	name: string;
	status: ResumeStatus; // 简历状态
	skill: SkillVo; // 关联的技能详细信息 (populated)
	projects: ProjectVo[]; // 关联的项目经验详细信息 (populated)
	careers: CareerVO[]; // 关联的工作经历详细信息 (populated)
	educations: EducationVO[]; // 关联的教育经历详细信息 (populated)

	resumeMatcheds?: string[]; // 派生的专用简历ID数组

	createdAt: string; // 创建时间
	updatedAt: string; // 最后更新时间
}

export type ResumeMatchedVo = Omit<ResumeVo, 'resumeMatcheds' | 'careers' | 'educations'> & {
	jobId: string;
	job: JobVo;
};

/**
 * 分页后的简历列表结果
 */
export interface PaginatedResumesResult {
	data: ResumeVo[]; // 当前页的简历数据
	total: number; // 总记录数
	page: number; // 当前页码
	limit: number; // 每页数量
}

/**
 * 分页后的简历列表结果
 */
export interface PaginatedResumeMatchedResult {
	data: ResumeMatchedVo[]; // 当前页的简历数据
	total: number; // 总记录数
	page: number; // 当前页码
	limit: number; // 每页数量
}
