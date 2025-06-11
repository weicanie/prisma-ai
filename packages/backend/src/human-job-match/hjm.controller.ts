import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserInfoFromToken } from '@prism-ai/shared';
import { RequireLogin, UserInfo } from '../decorator';
import { HjmService } from './hjm.service';

@Controller('hjm')
@RequireLogin()
export class HjmController {
	constructor(private readonly hjmService: HjmService) {}

	/**
	 * 同步所有岗位数据到向量数据库
	 * @description 这是一个管理接口，用于将MongoDB中的岗位数据向量化并存入Pinecone
	 * @param userInfo - 自动注入的当前用户信息
	 * @returns 操作结果
	 */
	@Post('sync-jobs')
	syncJobsToVectorDB(@UserInfo() userInfo: UserInfoFromToken) {
		return this.hjmService.syncJobsToVectorDB(userInfo);
	}

	/**
	 * 为指定简历匹配岗位
	 * @param resumeId - 目标简历的ID
	 * @param userInfo - 自动注入的当前用户信息
	 * @param topK - 召回数量，默认为20
	 * @param rerankTopN - 最终返回的排序后岗位数量，默认为5
	 * @returns 排序后的岗位列表及匹配原因
	 */
	@Get('match/:resumeId')
	matchJobs(
		@Param('resumeId') resumeId: string,
		@UserInfo() userInfo: UserInfoFromToken,
		@Query('topK') topK?: string,
		@Query('rerankTopN') rerankTopN?: string
	) {
		const topKNum = topK ? parseInt(topK, 10) : 20;
		const rerankTopNNum = rerankTopN ? parseInt(rerankTopN, 10) : 5;
		return this.hjmService.matchJobsForResume(resumeId, userInfo, topKNum, rerankTopNNum);
	}
}
