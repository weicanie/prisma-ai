export interface InterviewSummaryCreateDto {
	content: string; // 面经内容
	job_type: string; // 职位类型
	own: boolean; // 是否为个人面经
	interview_type?: string; // 面试类型
	post_link?: string; // 题目链接（去掉query和hash）
	company_scale?: string; // 公司规模
	company_name?: string; // 公司名称
	turn?: string; // 面试轮次
	job_name?: string; // 职位名称
	job_link?: string; // 职位链接
}

export interface ImportSummariesDto {
	exporterId: number; // 导出者id
	importerId?: number; // 导入者id, 如果为空,则导入到当前登录用户
}
