import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserInfoFromToken } from '@prism-ai/shared';
import * as crypto from 'crypto';
import { RequireLogin, UserInfo } from '../decorator';
import { RedisService } from '../redis/redis.service';
import { TaskQueueService } from '../task-queue/task-queue.service';
import { MatchJobsDto } from './dto/match-jobs.dto';
import { HjmService } from './hjm.service';

@Controller('hjm')
@RequireLogin()
export class HjmController {
	constructor(
		private readonly hjmService: HjmService,
		private readonly taskQueueService: TaskQueueService,
		private readonly redisService: RedisService
	) {}

	/**
	 * 启动一个后台任务，同步所有岗位数据到向量数据库
	 * @description 将数据库中状态为 COMMITTED 的岗位数据进行向量化并存入向量数据库
	 * @param userInfo - 自动注入的当前用户信息
	 * @returns 创建的后台任务
	 */
	@Post('sync-jobs')
	startSyncJobsToVectorDB(@UserInfo() userInfo: UserInfoFromToken) {
		const sessionId = crypto.randomUUID();
		/* 
		默认爬取到的岗位都属于系统爬虫;
		目前用于匹配的岗位向量数据库是用户间共享的——都在job-index索引中 */
		return this.hjmService.startJobEmbeddingTask(this.hjmService.userInfoSpider, sessionId);
	}

	/**
	 * 启动一个后台任务，为指定简历匹配岗位
	 * @param matchJobsDto - 包含简历ID等信息的DTO
	 * @param userInfo - 自动注入的当前用户信息
	 * @returns 创建的后台任务
	 */
	@Post('match-jobs')
	startMatchJobs(@Body() matchJobsDto: MatchJobsDto, @UserInfo() userInfo: UserInfoFromToken) {
		const sessionId = crypto.randomUUID();
		const { resumeId, topK, rerankTopN } = matchJobsDto;
		return this.hjmService.startJobMatchTask(resumeId, userInfo, sessionId, topK, rerankTopN);
	}

	/**
	 * 获取任务状态和结果
	 * @description 根据任务ID查询任务状态，如果任务已完成，同时返回结果。
	 * @param taskId - 任务ID
	 * @returns 任务信息及结果
	 */
	@Get('/:taskId')
	async getTaskResult(@Param('taskId') taskId: string) {
		const task = await this.taskQueueService.getTask(taskId);
		if (!task) {
			return { message: '任务不存在' };
		}

		if (task.status === 'completed' && task.resultKey) {
			const result = await this.redisService.get(task.resultKey);
			return {
				task,
				result: result ? JSON.parse(result) : null
			};
		}

		return { task };
	}
}
