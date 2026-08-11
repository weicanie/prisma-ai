import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { type UserInfoFromToken } from '@prisma-ai/shared';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { RequireLogin, UserInfo } from '../../decorator';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { AnkiUploadService } from './anki-upload.service';
import { CrawlQuestionService } from './crawl-question.service';
import { StartCrawlQuestionDto } from './dto/start-crawl-question.dto';
import { QuestionService } from './question.service';
import { PdfQuestionBankImportService } from './pdf-question-bank-import.service';

@Controller('question')
export class QuestionController {
	constructor(
		private readonly questionService: QuestionService,
		private readonly crawlQuestionService: CrawlQuestionService,
		private readonly ankiUploadService: AnkiUploadService,
		private readonly pdfQuestionBankImportService: PdfQuestionBankImportService,
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

	@RequireLogin()
	@Post('import-pdf-question-bank-to-anki')
	@UseInterceptors(FilesInterceptor('files', 50, { limits: { fileSize: Number(process.env.PDF_QUESTION_BANK_MAX_FILE_SIZE ?? 100 * 1024 * 1024) } }))
	async importPdfQuestionBank(
		@UploadedFiles() files: Array<{ originalname: string; buffer: Buffer }>,
		@Body() body: { projectKnowledgeId?: string },
		@UserInfo() userInfo: UserInfoFromToken
	) {
		if (!files?.length) throw new BadRequestException('请至少选择一个 PDF 文件');
		if (files.some(file => path.extname(file.originalname).toLowerCase() !== '.pdf')) {
			throw new BadRequestException('智能 PDF 题库导入仅支持 PDF 文件');
		}
		const sessionId = crypto.randomUUID();
		const root = path.join(process.env.PDF_QUESTION_BANK_UPLOAD_DIR ?? path.join(os.tmpdir(), 'prisma-ai', 'pdf-question-bank'), sessionId);
		await fs.mkdir(root, { recursive: true });
		for (const [index, file] of files.entries()) {
			const safeName = path.basename(file.originalname).replace(/[^\w.\-\u4e00-\u9fff]/g, '_');
			const name = `${index}-${safeName}`;
			if (!name) throw new BadRequestException('PDF 文件名无效');
			await fs.writeFile(path.join(root, name), file.buffer);
		}
		const task = await this.pdfQuestionBankImportService.start(userInfo, sessionId, root, body.projectKnowledgeId);
		return { id: task.id };
	}

	@RequireLogin()
	@Post('import-pdf-question-bank-to-anki/retry/:taskId')
	async retryPdfQuestionBankImport(@Param('taskId') taskId: string, @UserInfo() userInfo: UserInfoFromToken) {
		const task = await this.taskQueueService.getTask<any>(taskId);
		if (!task || task.type !== 'import-pdf-question-bank-to-anki' || task.userId !== String(userInfo.userId)) {
			throw new NotFoundException('导入任务不存在');
		}
		if (!['completed', 'failed', 'aborted'].includes(task.status)) {
			throw new BadRequestException('导入任务仍在运行，不能重试');
		}
		const retry = await this.pdfQuestionBankImportService.retry(task, userInfo);
		return { id: retry.id };
	}

	@RequireLogin()
	@Post('task/:taskId/abort')
	async abortTask(@Param('taskId') taskId: string, @UserInfo() userInfo: UserInfoFromToken) {
		const task = await this.taskQueueService.getTask(taskId);
		if (!task || task.userId !== String(userInfo.userId)) throw new NotFoundException('任务不存在');
		return { id: taskId, aborted: await this.taskQueueService.abortTask(taskId) };
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
