import type {
	CreateJobDto,
	JobVo,
	MatchedJobVo,
	PaginatedJobsResult,
	ServerDataFormat as SDF,
	UpdateJobDto
} from '@prisma-ai/shared'; // 假设shared包中已定义这些类型
import { instance } from './config';

/**
 * 创建新的招聘信息
 * @param jobData 创建招聘信息所需的数据
 * @returns 返回创建的招聘信息数据
 */
export async function createJob(jobData: CreateJobDto) {
	const res = await instance.post<CreateJobDto, SDF<JobVo>>('/job', jobData);
	return res.data;
}

/**
 * 获取当前用户的所有招聘信息（分页）
 * @param page 页码
 * @param limit 每页数量
 * @returns 返回招聘信息列表数据
 */
export async function findAllUserJobs(page?: number, limit?: number) {
	const res = await instance.get<SDF<PaginatedJobsResult>>(`/job/all?page=${page}&limit=${limit}`);
	return res.data;
}

/**
 * 获取当前用户指定ID的招聘信息
 * @param id 招聘信息ID
 * @returns 返回指定的招聘信息数据
 */
export async function findOneUserJob(id: string) {
	const res = await instance.get<SDF<JobVo>>(`/job/one/${id}`);
	return res.data;
}

/**
 * 根据简历ID查询所有匹配的岗位
 * @param resumeId 简历ID
 * @returns 返回匹配的岗位列表，包含匹配原因
 */
export async function findAllMatchedJobs(resumeId: string) {
	const res = await instance.get<SDF<MatchedJobVo[]>>(`/job/matched/${resumeId}`);
	return res.data;
}

/**
 * 更新指定ID的招聘信息
 * @param id 招聘信息ID
 * @param jobUpdateData 更新招聘信息所需的数据
 * @returns 返回更新后的招聘信息数据
 */
export async function updateJob(id: string, jobUpdateData: UpdateJobDto) {
	const res = await instance.patch<UpdateJobDto, SDF<JobVo>>(`/job/${id}`, jobUpdateData);
	return res.data;
}

/**
 * 删除指定ID的招聘信息
 * @param id 招聘信息ID
 * @returns 返回操作结果
 */
export async function removeJob(id: string) {
	const res = await instance.delete<SDF<null>>(`/job/${id}`);
	return res.data;
}
