import type {
	CreateResumeDto,
	ResumeVo,
	ServerDataFormat as SDF,
	UpdateResumeDto
} from '@prism-ai/shared';
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
	const res = await instance.get<SDF<ResumeVo[]>>('/resume', {
		params: { page, limit }
	});
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
