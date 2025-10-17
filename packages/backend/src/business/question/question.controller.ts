import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { type UserInfoFromToken } from '@prisma-ai/shared';
import * as crypto from 'crypto';
import { RequireLogin, UserInfo } from '../../decorator';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { AnkiUploadService } from './anki-upload.service';
import { CrawlQuestionService } from './crawl-question.service';
import { StartCrawlQuestionDto } from './dto/start-crawl-question.dto';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
	constructor(
		private readonly questionService: QuestionService,
		private readonly crawlQuestionService: CrawlQuestionService,
		private readonly ankiUploadService: AnkiUploadService,
		private readonly taskQueueService: TaskQueueService
	) {}

	/**
	 * @description 触发一个后台任务，将指定用户的所有题目上传到Anki
	 */
	@RequireLogin()
	@Post('upload-to-anki')
	async uploadToAnki(@UserInfo() userInfo: UserInfoFromToken) {
		const sessionId = crypto.randomUUID();
		const task = await this.ankiUploadService.addAnkiUploadTask(+userInfo.userId, sessionId);
		return { id: task.id };
	}

	/**
	 * @description 启动一个后台任务，为指定用户的所有面试题生成思维导图
	 * @param userInfo - 从token中解析出的用户信息，用于生成任务的sessionId
	 * @returns
	 */
	@RequireLogin()
	@Post('generate-mindmap')
	async generateMindmapForUser(@UserInfo() userInfo: UserInfoFromToken) {
		const sessionId = crypto.randomUUID();
		const task = await this.questionService.addMindmapGenerationTask(userInfo, sessionId);
		return { id: task.id };
	}

	/**
	 * @description 获取任务的状态和结果
	 */
	@RequireLogin()
	@Get('task/:taskId')
	async getTaskResult(@Param('taskId') taskId: string) {
		const task = await this.taskQueueService.getTask(taskId);
		if (!task) {
			throw new NotFoundException(`任务ID ${taskId} 未找到`);
		}
		// 适配前端需要的格式
		const taskVo = {
			id: task.id,
			status: task.status,
			progress: task.metadata?.progress
				? {
						totalCount: task.metadata.progress.totalCount,
						completedCount: task.metadata.progress.completedCount
					}
				: undefined,
			error: task.error,
			result: task.status === 'completed' ? (task as any).result : undefined
		};
		return { task: taskVo };
	}

	@RequireLogin()
	@Post('crawl')
	async startCrawlQuestions(
		@Body() startCrawlQuestionDto: StartCrawlQuestionDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		const task = await this.crawlQuestionService.startCrawl({
			...startCrawlQuestionDto,
			userId: userInfo.userId.toString(),
			userInfo
		});
		return { id: task.id };
	}
}
