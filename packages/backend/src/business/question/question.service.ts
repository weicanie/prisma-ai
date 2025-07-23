import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { chunk } from 'lodash';
import { ChainService } from '../../chain/chain.service';
import { DbService } from '../../DB/db.service';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { PersistentTask } from '../../type/taskqueue';

interface MindmapGenerationTask extends PersistentTask {
	metadata: {
		options: {
			userId: number;
		};
		progress: {
			totalCount: number;
			completedCount: number;
		};
	};
}

/**
 * @description 面试题相关服务
 */
@Injectable()
export class QuestionService implements OnModuleInit {
	private readonly logger = new Logger(QuestionService.name);
	private readonly CONCURRENCY = 50; // LLM Chain并发数
	private readonly BATCH_SIZE = 5; // 每个LLM Chain处理的题目数量
	private readonly PAGE_SIZE = 500; // 每次从数据库查询的题目数量

	constructor(
		private readonly db: DbService,
		private readonly chainService: ChainService,
		private readonly taskQueueService: TaskQueueService
	) {}

	/**
	 * @description 模块初始化时，向任务队列服务注册任务处理器
	 */
	onModuleInit() {
		this.taskQueueService.registerTaskHandler(
			'generate-mindmaps-for-user',
			this.handleGenerateMindmaps.bind(this)
		);
	}

	/**
	 * @description 将为用户生成思维导图的任务添加到队列
	 * @param userId - 用户ID
	 * @param sessionId - 会话ID，用于追踪任务
	 */
	async addMindmapGenerationTask(userId: number, sessionId: string) {
		this.logger.log(`为用户 ${userId} 添加思维导图生成任务`);
		// 使用现有的任务队列服务创建并派发一个任务
		const task = await this.taskQueueService.createAndEnqueueTask(
			sessionId,
			userId.toString(),
			'generate-mindmaps-for-user',
			{
				options: { userId },
				progress: { totalCount: -1, completedCount: 0 }
			}
		);
		return task;
	}

	/**
	 * @description 处理为用户生成思维导图的任务
	 * @param task - 任务对象，包含了任务数据
	 */
	async handleGenerateMindmaps(task: MindmapGenerationTask) {
		const { userId } = task.metadata.options;
		this.logger.log(`开始处理任务 ${task.id}，为用户 ${userId} 生成思维导图...`);

		try {
			// 统计用户未生成思维导图的题目数量（多对多改造）
			const totalCount = await this.db.user_article.count({
				where: {
					user_id: userId,
					article: {
						OR: [{ content_mindmap: null }, { content_mindmap: '无' }]
					}
				}
			});

			await this._updateTaskProgress(task, { totalCount, completedCount: 0 });

			if (totalCount === 0) {
				this.logger.log(`用户 ${userId} 没有需要生成思维导图的题目。`);
				return;
			}

			const mindmapChain = await this.chainService.getMindmapGenerationChain();
			let hasMore = true;
			let completedCount = 0;

			// 处理用户的所有未处理题目（多对多改造）
			while (hasMore) {
				const userArticles = await this.db.user_article.findMany({
					where: {
						user_id: userId,
						article: {
							OR: [{ content_mindmap: null }, { content_mindmap: '无' }]
						}
					},
					include: {
						article: {
							select: { id: true, title: true, content: true, gist: true }
						}
					},
					take: this.PAGE_SIZE
				});

				if (userArticles.length === 0) {
					hasMore = false;
					continue;
				}

				// 将查询到的题目分批（每批5个），用于LLM处理
				const articleBatches = chunk(userArticles, this.BATCH_SIZE);

				// 以50个并发为一组来处理所有批次
				const concurrencyBatches = chunk(articleBatches, this.CONCURRENCY);
				for (const concurrencyBatch of concurrencyBatches) {
					await Promise.all(
						concurrencyBatch.map(async batch => {
							// 检查任务是否已被中止
							const currentTaskStatus = await this.taskQueueService.getTask(task.id);
							if (currentTaskStatus?.status !== 'running') {
								this.logger.warn(`任务 ${task.id} 已非运行状态，中止当前批次处理。`);
								return; // 如果任务不是running状态，则不再继续处理
							}

							try {
								// 准备LLM的输入数据，并替换使用的anki markdown插件无法渲染的特殊字符
								const input = batch.map(userArticle => ({
									title: userArticle.article.title.replace(/\*   /g, '- '),
									content: userArticle.article.content.replace(/\*   /g, '- '),
									gist: (userArticle.article.gist || '').replace(/\*   /g, '- ')
								}));

								// 调用LLM Chain
								const response = await mindmapChain.invoke({ questions: input });

								// 准备数据库更新操作
								const updatePromises = batch.map((userArticle, index) =>
									this.db.article.update({
										where: { id: userArticle.article.id },
										data: {
											content_mindmap: response.results[index],
											content: input[index].content,
											gist: input[index].gist,
											title: input[index].title
										}
									})
								);

								// 在一个事务中批量更新数据库
								await this.db.$transaction(updatePromises);

								completedCount += batch.length;
								await this._updateTaskProgress(task, { totalCount, completedCount });

								this.logger.log(
									`任务 ${task.id}: 成功处理并更新了 ${batch.length} 条数据。已完成(${completedCount}/${totalCount})`
								);
							} catch (e) {
								this.logger.error(`任务 ${task.id} 处理批次时出错: ${e.message}`, e.stack);
								// 单个批次失败不影响其他批次，仅记录日志
							}
						})
					);
				}
			}
			this.logger.log(`为用户 ${userId} 生成思维导图的任务 ${task.id} 已全部完成。`);
		} catch (error) {
			this.logger.error(
				`为用户 ${userId} 生成思维导图时发生严重错误 (任务ID: ${task.id}): ${error.message}`,
				error.stack
			);
			throw error; // 抛出错误以便TaskQueueService捕获并标记任务为失败
		}
	}

	/**
	 * 更新任务进度
	 */
	private async _updateTaskProgress(
		task: MindmapGenerationTask,
		progress: { totalCount: number; completedCount: number }
	): Promise<void> {
		const curTask = await this.taskQueueService.getTask<MindmapGenerationTask>(task.id);
		if (!curTask) return;

		const newTask: MindmapGenerationTask = {
			...curTask,
			metadata: {
				...curTask.metadata,
				progress
			}
		};
		await this.taskQueueService.saveTask(newTask);
	}

	/**
	 * 获取任务进度
	 */
	async getTaskProgress(
		task: MindmapGenerationTask
	): Promise<{ totalCount: number; completedCount: number }> {
		const curTask = await this.taskQueueService.getTask<MindmapGenerationTask>(task.id);
		if (!curTask || !curTask.metadata.progress) return { totalCount: -1, completedCount: 0 };
		return curTask.metadata.progress;
	}
}
