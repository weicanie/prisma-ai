import { Injectable, Logger } from '@nestjs/common';
import { StreamingChunk, UserInfoFromToken } from '@prism-ai/shared';
import { catchError, mergeMap, timeout } from 'rxjs';
import { ChainService } from '../chain/chain.service';
import { EventBusService, EventList } from '../EventBus/event-bus.service';
import { RedisService } from '../redis/redis.service';
import { SessionPoolService } from '../session/session-pool.service';
import { PersistentTask, TaskQueueService } from '../task-queue/task-queue.service';
import { ProjectService } from './../business/project/project.service';
import { LLMCacheService } from './LLMCache.service';

interface SseTask extends PersistentTask {}
/* redis中结果的存储形式 */
export interface redisStoreResult {
	content: string; // 生成的内容
	reasonContent?: string; // 推理阶段的内容
	done: boolean; // 是否完成
	isReasoning?: boolean; // 是否是推理阶段
}

//TODO 相关业务模块自己持有自己的sse返回逻辑,分离出子service
@Injectable()
export class SseService {
	private readonly logger = new Logger(SseService.name);

	/**
	 * 存储每个任务的chunk数组池
	 */
	chunkArrayPool: Record<string, StreamingChunk[]> = {};

	/* 任务类型,用于映射到特定任务处理器 */
	taskType = {
		project: 'sse_project'
	};

	constructor(
		private taskQueueService: TaskQueueService,
		private eventBusService: EventBusService,
		private redisService: RedisService,
		private readonly chainService: ChainService,
		private readonly sessionPool: SessionPoolService,
		private readonly llmCache: LLMCacheService,
		private readonly projectService: ProjectService
	) {
		/* 注册任务处理器 */
		this.registerTaskHandler();
	}
	/* 注册任务处理器 */
	async registerTaskHandler() {
		try {
			this.taskQueueService.registerTaskHandler(
				this.taskType.project,
				this.taskHandlerProject.bind(this)
			);
		} catch (error) {
			this.logger.error(`SSE任务处理器注册失败: ${error}`);
		}
		this.logger.log(`SSE任务处理器已注册: ${this.taskType.project}`);
	}
	/* sse数据推送任务处理器-project service
  核心逻辑：llm边生成、边往http连接推送数据、边存入redis中的taskid标识的event数组
    支持数据获取和断点续传逻辑：接口通过订阅 chunkGenerated事件 返回数据给前端、处理可能的断点续传

	注意：返回的是Observable对象,用一个Promise对象包裹使其内部逻辑得到执行
		因为taskQueueService里不应该放具体执行逻辑, 这么做taskQueueService里只用处理Promise对象
	*/
	async taskHandlerProject(task: SseTask): Promise<void> {
		const { sessionId, userId, id: taskId } = task;

		/* 获取上下文 */
		const context = await this.sessionPool.getContext(sessionId);
		if (!context || !context.input) {
			throw new Error('会话上下文不完整，请先创建会话');
		}

		/* 调用llm开启流式传输 */
		const observable = await this.projectService[this.projectService.target_method[context.target]](
			context.input,
			context.userInfo,
			taskId
		);
		/* 返回一个Promise，该Promise在该Observable完成时才会解析 */
		return new Promise<void>((resolve, reject) => {
			//TODO 调试llm缓存功能
			/* 1、过llm缓存 
				对于相同的prompt, 直接返回
				对于高度相似的prompt, 使用其回答作为上下文二次生成（prompt设计：问ai、上hub）
				不仅可以节省token, 同时前端重复请求就算导致会话多次创建、也不会导致llm多次生成
			*/

			// step1: 检查完全匹配的缓存
			// const exactCacheResult = await this.llmCache.checkExactCache(context);
			// if (exactCacheResult) {
			// 模拟流式传输缓存结果
			// return this.llmCache.createCachedResponse(exactCacheResult);
			// }

			// step2: 检查高度相似的缓存
			// const similarCacheResult = await this.llmCache.getSimilarCacheResult(context);
			// if (similarCacheResult) {
			// 如果相似度非常高(>0.95)，直接返回缓存结果
			// if (similarCacheResult.similarity > 0.95) {
			// return this.llmCache.createCachedResponse(similarCacheResult.result, true);
			// }
			// }

			/* 创建订阅 */
			const subscription = observable
				.pipe(
					mergeMap(async (chunk: StreamingChunk) => {
						if (chunk) {
							/* 储存到redis、发送chunk抵达事件 */
							await this.saveSseEventData(taskId, chunk);
						}

						/* 服务端完成
						删除userId ->sessionId的映射,释放用户会话
            保留sessionId -> session的映射, 以供客户端恢复
						*/
						if (chunk.done) {
							await this.sessionPool.delUserSessionId(userId);
							await this.sessionPool.setBackendDone(sessionId);
						}

						return chunk;
					}),
					/* 二、服务端异常
          删除userId ->sessionId的映射,释放用户会话
          将异常信息返回给客户端
          */
					timeout(5 * 60 * 1000), // 5分钟超时
					catchError(async error => {
						await this.sessionPool.setBackendDone(sessionId);
						await this.sessionPool.delUserSessionId(userId);

						// 拒绝Promise
						reject(error);
						return [];
					})
				)
				.subscribe({
					next: () => {}, // 处理已在mergeMap中完成
					error: err => {
						console.error('SSE任务执行错误:', err);
						reject(err);
					},
					complete: () => {
						resolve();
					}
				});

			// 设置任务取消器
			task.metadata = task.metadata || {};
			task.metadata.cancelFn = () => {
				subscription.unsubscribe();
				reject(new Error('任务被中止'));
			};
		});
	}

	/* 创建任务并入队 */
	async createAndEnqueueTaskProject(sessionId: string, userInfo: UserInfoFromToken) {
		const task = await this.taskQueueService.createAndEnqueueTask(
			sessionId,
			userInfo.userId,
			this.taskType.project
		);
		return task;
	}

	//FIXME 数据存储异常
	/** 工具-将当前生成的chunk储存到redis中
	 * 事件处理器内部调用
	 */
	async saveSseEventData(taskId: string, chunk: StreamingChunk): Promise<void> {
		const task = await this.taskQueueService.getTask<SseTask>(taskId);
		if (!task) {
			throw new Error(`任务不存在: ${taskId}`);
		}
		// 发出chunk抵达事件
		this.eventBusService.emit(EventList.chunkGenerated, { taskId, eventData: chunk });

		if (!this.chunkArrayPool[taskId]) {
			this.chunkArrayPool[taskId] = [];
		}

		this.chunkArrayPool[taskId].push(chunk);
		if (chunk.done) {
			const content = this.chunkArrayPool[taskId].reduce((prev, cur) => {
				return prev + (cur.content || '');
			}, '');
			const reasonContent = this.chunkArrayPool[taskId].reduce((prev, cur) => {
				return prev + (cur.reasonContent || '');
			}, '');
			const result = {
				content,
				reasonContent,
				done: chunk.done,
				isReasoning: chunk.isReasoning
			};
			const resultKey = `${this.taskQueueService.PREFIX.RESULT}${taskId}`;
			task.resultKey = resultKey;
			await this.taskQueueService.saveTask(task);

			// 储存当前结果到redis中
			await this.redisService.set(task.resultKey, JSON.stringify(result), 24 * 60 * 60);
			delete this.chunkArrayPool[taskId]; // 清理内存
			this.logger.log(`任务${taskId}已完成，结果已存储到redis中`);
		}
	}

	/** 工具-断点续传接口调用
	 * 获取任务已生成的所有chunk
	 */
	async getSseTaskEvents(taskId: string): Promise<redisStoreResult> {
		const resultKey = `${this.taskQueueService.PREFIX.RESULT}${taskId}`;
		let result: redisStoreResult;
		const json = await this.redisService.get(resultKey);
		try {
			result = json
				? (JSON.parse(json) as redisStoreResult)
				: {
						content: '',
						reasonContent: '',
						done: false,
						isReasoning: false
					};
		} catch (error) {
			this.logger.error(`任务${resultKey}解析redis结果失败: ${error}`);
			return {
				content: '错误,请重试',
				reasonContent: '',
				done: true,
				isReasoning: true
			};
		}
		return result;
	}
}
