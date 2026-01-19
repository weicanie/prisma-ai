import { type ProjectVo, type ServerDataFormat as SDF } from '@prisma-ai/shared';
import { instance } from './config';

/**
 * 获取用户的所有项目经验
 */
export async function findAllProjects() {
	const res = await instance.get<SDF<ProjectVo[]>>('/project/all');
	return res.data;
}
