/**
 * 用户管理接口前后端共享的类型。
 */
/**
 * 用户信息
 */
export interface UserProfile {
	id: number;
	username: string;
	email: string;
	role: string;
	is_banned: boolean;
	create_at: Date | null;
}

/**
 * 获取用户列表的响应
 */
export interface GetUsersResponse {
	users: UserProfile[];
	total: number;
}

/**
 * 获取用户列表的查询参数
 */
export interface GetUsersQuery {
	page: number;
	limit: number;
}
/**
 * 用户违规类型
 */
export enum ViolationType {
	/**
	 * 频繁上传垃圾内容
	 */
	junkContent = 'junk_content',

	/**
	 * 上传敏感内容
	 */
	sensitiveContent = 'sensitive_content',

	/**
	 * 其他
	 */
	other = 'other'
}

export interface UserViolationVo {
	userId: number;
	email: string;
	junkContentCount: number; //上传垃圾内容次数
	sensitiveContentCount: number; //上传敏感内容次数
	otherCount: number; //其他次数
}

export interface ViolationVo {
	userId: number;
	email: string;
	violationType: ViolationType; //违规类型
	violationDescription: string; //违规描述
}
