import type {
	CreateResumeDto,
	PaginatedResumeMatchedResult,
	PaginatedResumesResult,
	ResumeVo,
	ServerDataFormat as SDF,
	UpdateResumeDto
} from '@prisma-ai/shared';
import { instance } from './config';

/**
 * 创建新的简历
 * @param resumeData 创建简历所需的数据
 * @returns 返回创建的简历数据
 */
export async function createResume(resumeData: CreateResumeDto) {
	const res = await instance.post<CreateResumeDto, SDF<ResumeVo>>('/resume', resumeData);
	return res.data;
}

/**
 * 获取当前用户的所有简历（分页）
 * @param page 页码
 * @param limit 每页数量
 * @returns 返回简历列表数据
 */
export async function findAllUserResumes(page?: number, limit?: number) {
	const res = await instance.get<SDF<PaginatedResumesResult>>(
		`/resume/all?page=${page}&limit=${limit}`
	);
	return res.data;
}

/**
 * 获取当前用户指定ID的简历
 * @param id 简历ID
 * @returns 返回指定的简历数据
 */
export async function findOneUserResume(id: string) {
	const res = await instance.get<SDF<ResumeVo>>(`/resume/${id}`);
	return res.data;
}

/**
 * 更新指定ID的简历
 * @param id 简历ID
 * @param resumeUpdateData 更新简历所需的数据
 * @returns 返回更新后的简历数据
 */
export async function updateResume(id: string, resumeUpdateData: UpdateResumeDto) {
	const res = await instance.patch<UpdateResumeDto, SDF<ResumeVo>>(
		`/resume/${id}`,
		resumeUpdateData
	);
	return res.data;
}

/**
 * 删除指定ID的简历
 * @param id 简历ID
 * @returns 返回操作结果
 */
export async function removeResume(id: string) {
	const res = await instance.delete<SDF<null>>(`/resume/${id}`);
	return res.data;
}

/**
 * 删除指定ID的专用简历
 * @param id 专用简历ID
 * @returns 返回操作结果
 */
export async function removeResumeMatched(id: string) {
	const res = await instance.delete<SDF<null>>(`/resume/matched/${id}`);
	return res.data;
}

/**
 * 获取指定岗位的专用简历
 * @param jobId 岗位ID
 * @returns 返回该岗位专用的简历,和普通简历格式是一样的,只是多了jobId字段
 */
export async function findResumeMatchedByJobId(jobId: string) {
	const res = await instance.get<SDF<ResumeVo>>(`/resume/matched/one/${jobId}`);
	return res.data;
}

/**
 * 获取所有岗位专用简历
 * @param page 页码
 * @param limit 每页数量
 * @returns 返回所有岗位专用简历
 */
export async function findAllResumeMatched(page?: number, limit?: number) {
	const res = await instance.get<SDF<PaginatedResumeMatchedResult>>(
		`/resume/matched/all?page=${page}&limit=${limit}`
	);
	return res.data;
}

/**
 * 简历导出到编辑器
 * @param id 简历ID
 */
export async function exportResumeToEditor(id: string) {
	const res = await instance.get<SDF<string>>(`/resume/export/${id}`);
	return res.data;
}
