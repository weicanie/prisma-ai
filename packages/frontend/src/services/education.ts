import type {
	CreateEducationDtoShared,
	EducationVO,
	ServerDataFormat as SDF
} from '@prisma-ai/shared';
import { instance } from './config';

// 创建教育经历
export async function createEducation(body: CreateEducationDtoShared) {
	const res = await instance.post<CreateEducationDtoShared, SDF<EducationVO>>('/education', body);
	return res.data;
}

// 查询当前用户的教育经历列表
export async function findAllEducations() {
	const res = await instance.get<SDF<EducationVO[]>>('/education');
	return res.data;
}

// 根据ID查询
export async function findOneEducation(id: string) {
	const res = await instance.get<SDF<EducationVO>>(`/education/${id}`);
	return res.data;
}

// 更新
export async function updateEducation(id: string, body: Partial<CreateEducationDtoShared>) {
	const res = await instance.patch<Partial<CreateEducationDtoShared>, SDF<EducationVO>>(
		`/education/${id}`,
		body
	);
	return res.data;
}

// 删除
export async function removeEducation(id: string) {
	const res = await instance.delete<SDF<null>>(`/education/${id}`);
	return res.data;
}
