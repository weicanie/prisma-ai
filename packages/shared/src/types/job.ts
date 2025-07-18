// 定义招聘信息相关的 DTO 和 VO

import { UserInfoFromToken } from './loginVerify';

export enum JobOpenStatus {
	OPEN = 'open', //招聘中
	CLOSED = 'closed' //已停止招聘
}

export enum JobStatus {
	COMMITTED = 'committed', //存储了但未处理
	EMBEDDED = 'embedded', //已embedding
	MATCHED = 'matched' //已被用户简历追踪
}

/**
 * 创建招聘信息的 DTO
 */
export interface CreateJobDto {
	jobName: string; // 职位名称
	companyName: string; // 公司名称
	description: string; // 职位描述
	location?: string; // 工作地点
	salary?: string; // 薪资范围
	link?: string; // 职位链接
	job_status?: JobOpenStatus; // 职位状态， "open", "closed"
}

export type LLMJobDto = Pick<CreateJobDto, 'jobName' | 'companyName' | 'description'>;

/**
 * 更新招聘信息的 DTO (CreateJobDto 的部分属性)
 */
export type UpdateJobDto = Partial<CreateJobDto>;

/**
 * 招聘信息的 VO (View Object)
 * 用于API响应和前端展示
 */
export interface JobVo {
	id: string; // 数据库中的ID
	jobName: string;
	companyName: string;
	description: string;
	location?: string;
	salary?: string;
	link?: string;
	job_status?: JobOpenStatus; // 职位状态， "open", "closed"
	status?: JobStatus; // 职位内部状态，"committed", "embedded", "matched" 未处理、已embedding、已被用户简历追踪
	userInfo: UserInfoFromToken; // 用户信息，用于判断是否是爬虫抓取的岗位
	createdAt: string;
	updatedAt: string;
}

/**
 * 分页后的招聘信息列表结果
 */
export interface PaginatedJobsResult {
	data: JobVo[]; // 当前页的招聘信息数据
	total: number; // 总记录数
	page: number; // 当前页码
	limit: number; // 每页数量
}
