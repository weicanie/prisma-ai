import type { CareerVO, CreateCareerDtoShared, ServerDataFormat as SDF } from '@prisma-ai/shared';
import { instance } from './config';

// 创建工作经历
export async function createCareer(body: CreateCareerDtoShared) {
	const res = await instance.post<CreateCareerDtoShared, SDF<CareerVO>>('/career', body);
	return res.data;
}

// 查询当前用户的工作经历列表
export async function findAllCareers() {
	const res = await instance.get<SDF<CareerVO[]>>('/career');
	return res.data;
}

// 根据ID查询
export async function findOneCareer(id: string) {
	const res = await instance.get<SDF<CareerVO>>(`/career/${id}`);
	return res.data;
}

// 更新
export async function updateCareer(id: string, body: Partial<CreateCareerDtoShared>) {
	const res = await instance.patch<Partial<CreateCareerDtoShared>, SDF<CareerVO>>(
		`/career/${id}`,
		body
	);
	return res.data;
}

// 删除
export async function removeCareer(id: string) {
	const res = await instance.delete<SDF<null>>(`/career/${id}`);
	return res.data;
}
