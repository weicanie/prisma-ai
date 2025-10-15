import { UserInfoFromToken } from '@prisma-ai/shared';

export type ResumeData = any;

/**
 * 简历数据仓库管理器
 */
export interface ResumeRepositoryManager {
	/**
	 * 进行简历数据的创建（C）和更新（U）
	 */
	syncResumeToRepository: (
		resumeData: ResumeData,
		userInfo: UserInfoFromToken,
		prevResume?: ResumeData
	) => Promise<void>;
	/**
	 * 进行简历数据的删除（D）
	 */
	deleteResumeFromRepository: (resume: ResumeData, userInfo: UserInfoFromToken) => Promise<void>;
	/**
	 * 进行简历数据的获取（R）
	 * @description 从文件系统或数据库中获取简历数据
	 * @warning 需要接收方自行同步到store中
	 */
	getResumeFromRepository: (userInfo: UserInfoFromToken) => Promise<ResumeData[]>;
}
