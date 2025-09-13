import type { UserInfoFromToken } from '../loginVerify';

// 与后端 CreateEducationDto 对齐的请求体类型（供前端表单提交使用）
export type EducationDegree = '博士' | '硕士' | '本科' | '大专' | '高中' | '其他';

export interface CreateEducationDtoShared {
	school: string;
	major: string;
	degree: EducationDegree;
	startDate: string; // ISO 字符串，如 '2022-09-01'
	endDate?: string;
	visible?: boolean;
	gpa?: string;
	description?: string;
}
export type UpdateEducationDto = Partial<CreateEducationDtoShared>;
// 与后端 Mongo Schema 的 toJSON 输出对齐
export interface EducationVO {
	id: string;
	userInfo: UserInfoFromToken;
	school: string;
	major: string;
	degree: EducationDegree;
	startDate: string; // 序列化后为字符串
	endDate?: string;
	visible: boolean;
	gpa?: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
}
