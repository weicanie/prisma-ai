import type {
	CreateKnowledgeDto,
	KnowledgeVo,
	PaginatedKnsResult,
	ServerDataFormat as SDF, // Added ServerDataFormat
	UpdateKnowledgeDto
} from '@prisma-ai/shared';
import { instance } from './config';

const BASE_URL = '/knowledge-base';

/**
 * 创建新的知识库条目
 * @param data 创建知识库条目所需的数据
 * @returns 返回创建的知识库条目数据
 */
export async function createKnowledge(data: CreateKnowledgeDto): Promise<SDF<KnowledgeVo>> {
	const res = await instance.post<CreateKnowledgeDto, SDF<KnowledgeVo>>(`${BASE_URL}`, data);
	return res.data;
}

/**
 * 获取当前用户的所有知识库条目（分页）
 * @param params 可选的分页参数 { page?: number; limit?: number }
 * @returns 返回分页的知识库列表数据
 */
export async function findAllUserKnowledge(params?: {
	page?: number;
	limit?: number;
}): Promise<SDF<PaginatedKnsResult>> {
	const res = await instance.get<SDF<PaginatedKnsResult>>(`${BASE_URL}`, { params });
	return res.data;
}

/**
 * 获取当前用户指定ID的知识库条目
 * @param id 知识库条目ID
 * @returns 返回指定的知识库条目数据
 */
export async function findOneUserKnowledge(id: string): Promise<SDF<KnowledgeVo>> {
	const res = await instance.get<SDF<KnowledgeVo>>(`${BASE_URL}/${id}`);
	return res.data;
}

/**
 * 更新指定ID的知识库条目
 * @param id 知识库条目ID
 * @param data 更新知识库条目所需的数据
 * @returns 返回更新后的知识库条目数据
 */
export async function updateKnowledge(
	id: string,
	data: UpdateKnowledgeDto
): Promise<SDF<KnowledgeVo>> {
	const res = await instance.patch<UpdateKnowledgeDto, SDF<KnowledgeVo>>(`${BASE_URL}/${id}`, data);
	return res.data;
}

/**
 * 删除指定ID的知识库条目
 * @param id 知识库条目ID
 * @returns 返回操作结果
 */
export async function removeKnowledge(id: string): Promise<SDF<null>> {
	const res = await instance.delete<SDF<null>>(`${BASE_URL}/${id}`);
	return res.data;
}
