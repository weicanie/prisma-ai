// 定义招聘信息相关的 DTO 和 VO

/**
 * 创建招聘信息的 DTO
 */
export interface CreateJobDto {
	readonly jobName: string; // 职位名称
	readonly companyName: string; // 公司名称
	readonly description: string; // 职位描述
	readonly location?: string; // 工作地点
	readonly salary?: string; // 薪资范围
	readonly link?: string; // 职位链接
}

/**
 * 更新招聘信息的 DTO (CreateJobDto 的部分属性)
 */
export type UpdateJobDto = Partial<CreateJobDto>;

/**
 * 招聘信息的 VO (View Object)
 * 用于API响应和前端展示
 */
export interface JobVo {
	id?: string; // 数据库中的ID
	jobName: string;
	companyName: string;
	description: string;
	location?: string;
	salary?: string;
	link?: string;
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
