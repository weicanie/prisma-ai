import type { UserInfoFromToken } from '../loginVerify';

// 与后端 CreateCareerDto 对齐的请求体类型（供前端表单提交使用）
export interface CreateCareerDtoShared {
	company: string;
	position: string;
	startDate: string; // ISO 字符串，如 '2021-07-01'
	endDate?: string;
	visible?: boolean;
	details?: string;
}
export type UpdateCareerDto = Partial<CreateCareerDtoShared>;

// 与后端 Mongo Schema 的 toJSON 输出对齐
export interface CareerVO {
	id: string;
	userInfo: UserInfoFromToken;
	company: string;
	position: string;
	startDate: string; // 序列化后为字符串
	endDate?: string;
	visible: boolean;
	details?: string;
	createdAt: string;
	updatedAt: string;
}
