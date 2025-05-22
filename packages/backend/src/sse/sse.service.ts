import { Injectable, Logger } from '@nestjs/common';
import { DataChunk, UserInfoFromToken } from '@prism-ai/shared';
import { Observable, catchError, mergeMap, timeout } from 'rxjs';
import { ChainService } from '../chain/chain.service';
import { EventBusService, EventList } from '../EventBus/event-bus.service';
import { RedisService } from '../redis/redis.service';
import { SessionPoolService } from '../session/session-pool.service';
import { PersistentTask, TaskQueueService } from '../task-queue/task-queue.service';
import { LLMCacheService } from './LLMCache.service';

export interface SseEventData {
	content: string; // 内容
	done: boolean; // 是否完成

	error?: string; // 错误

	id: number; // 事件ID
	timestamp?: number; // 时间戳
}

interface SseTask extends PersistentTask {
	prompt: string; // 提示词
	sessionId: string; // 会话ID

	lastEventId?: number; // 最后一个事件ID（后端）
}

@Injectable()
export class SseService {
	private readonly logger = new Logger(SseService.name);
	taskType = 'sse';
	constructor(
		private taskQueueService: TaskQueueService,
		private eventBusService: EventBusService,
		private redisService: RedisService,
		private readonly chainService: ChainService,
		private readonly sessionPool: SessionPoolService,
		private readonly llmCache: LLMCacheService
	) {
		/* 注册任务处理器 */
		this.registerTaskHandler();
	}
	/* sse数据推送任务处理器
    核心逻辑：llm边生成、边往http连接推送数据、边存入redis中的taskid标识的event数组

    支持数据获取和断点续传逻辑：接口通过订阅 chunkGenerated事件 返回数据给前端、处理可能的断点续传
  */
	async taskHandler(task: SseTask) {
		const { sessionId, userId, id: taskId } = task;
		console.log('taskHandler执行', task);
		/* 正常启动、生成 */
		const context = await this.sessionPool.getContext(sessionId);
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

		/* 2、调用llm生成内容 */
		this.chainService.sseMock(context.prompt).pipe(
			mergeMap(async (chunk: any) => {
				console.log('mergeMap ~ chunk:', chunk);
				if (chunk.data?.content) {
					/* 储存到redis */
					await this.saveSseEventData(taskId, {
						content: chunk.data.content,
						done: chunk.data.done
					});
				}

				/* 一、服务端正常完成
            删除userId ->sessionId的映射,释放用户会话
            保留sessionId -> session的映射, 以供客户端恢复
            */
				if (chunk.data?.done) {
					await this.sessionPool.delUserSessionId(userId);
					/* 标记会话为服务端完成状态 */
					await this.sessionPool.setBackendDone(sessionId);
					//TODO 存入数据库持久化
				}

				return chunk;
			}),
			/* 二、服务端异常完成
          删除userId ->sessionId的映射,释放用户会话
          将异常信息返回给客户端
          */
			timeout(5 * 60 * 1000), // 设置超时时间为5分钟
			catchError(async error => {
				await this.sessionPool.setBackendDone(sessionId);
				// 超时错误
				if (error.name === 'TimeoutError') {
					await this.sessionPool.delUserSessionId(userId);

					return new Observable<DataChunk>(subscriber => {
						subscriber.next({
							data: {
								error: '生成超时，请尝试简化您的请求或稍后再试',
								done: true
							}
						});
						subscriber.complete();
					});
				} else {
					// 其他错误
					await this.sessionPool.delUserSessionId(userId);
					return new Observable<DataChunk>(subscriber => {
						subscriber.next({
							data: {
								error:
									'生成过程中发生错误: ' +
									(error.message || '未知错误') +
									'，请稍后再试或联系支持团队',
								done: true
							}
						});
						subscriber.complete();
					});
				}
			})
		);
	}
	/* sse数据推送任务处理器 
	注意：返回的是Observable对象,用一个Promise对象包裹使其内部逻辑得到执行
	因为taskQueueService里不应该放具体执行逻辑, 这么做taskQueueService里只用处理Promise对象
	*/
	async taskHandler2(task: SseTask): Promise<void> {
		const { sessionId, userId, id: taskId } = task;
		console.log('taskHandler执行', task);

		/* 获取上下文 */
		const context = await this.sessionPool.getContext(sessionId);

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
			const subscription = this.chainService
				.sseMock(context.prompt)
				.pipe(
					mergeMap(async (chunk: any) => {
						console.log('mergeMap ~ chunk:', chunk);
						if (chunk.data?.content) {
							/* 储存到redis */
							await this.saveSseEventData(taskId, {
								content: chunk.data.content,
								done: chunk.data.done
							});
						}

						/* 服务端正常完成 */
						if (chunk.data?.done) {
							await this.sessionPool.delUserSessionId(userId);
							await this.sessionPool.setBackendDone(sessionId);
						}

						return chunk;
					}),
					timeout(5 * 60 * 1000), // 5分钟超时
					catchError(async error => {
						await this.sessionPool.setBackendDone(sessionId);
						await this.sessionPool.delUserSessionId(userId);

						// 记录错误
						await this.saveSseEventData(taskId, {
							content: '',
							error:
								error.name === 'TimeoutError'
									? '生成超时，请尝试简化您的请求'
									: `生成错误: ${error.message || '未知错误'}`,
							done: true
						});

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
						console.log('SSE任务执行完成');
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
	/* 注册任务处理器 */
	async registerTaskHandler() {
		try {
			this.taskQueueService.registerTaskHandler(this.taskType, this.taskHandler2.bind(this));
		} catch (error) {
			this.logger.error(`SSE任务处理器注册失败: ${error}`);
		}
		this.logger.log('SSE任务处理器已注册');
	}

	/* 创建任务并入队 */
	async createAndEnqueueTask(sessionId: string, userInfo: UserInfoFromToken) {
		const task = await this.taskQueueService.createAndEnqueueTask(
			sessionId,
			userInfo.userId,
			this.taskType
		);
		return task;
	}
	/** 工具-事件处理器内部调用
	 * 将当前生成的chunk储存到redis中
	 */
	async saveSseEventData(
		taskId: string,
		chunk: Omit<SseEventData, 'id' | 'timestamp'>
	): Promise<number> {
		const task = await this.taskQueueService.getTask<SseTask>(taskId);
		if (!task) {
			throw new Error(`任务不存在: ${taskId}`);
		}

		// 计算新的事件ID
		const eventId = (task.lastEventId ?? -1) + 1;

		const eventData: SseEventData = {
			id: eventId,
			...chunk,
			timestamp: Date.now()
		};

		// 储存chunk到redis中
		const eventKey = `${this.taskQueueService.PREFIX.EVENTS}${taskId}`;
		await this.redisService.getClient().rPush(eventKey, JSON.stringify(eventData));
		await this.redisService.getClient().expire(eventKey, this.taskQueueService.TASK_TTL);

		// 更新 lastEventId
		task.lastEventId = eventId;
		await this.taskQueueService.saveTask(task);

		// 发出chunk抵达事件
		this.eventBusService.emit(EventList.chunkGenerated, { taskId, eventData });
		return eventId;
	}

	/** 工具-断点续传接口调用
	 * 获取任务已生成的所有chunk
	 */
	async getSseTaskEvents(taskId: string): Promise<SseEventData[]> {
		const eventKey = `${this.taskQueueService.PREFIX.EVENTS}${taskId}`;
		const data = await this.redisService.getClient().lRange(eventKey, 0, -1);
		return data.map(item => JSON.parse(item) as SseEventData).sort((a, b) => a.id - b.id);
	}

	/** 工具-断点续传接口调用
	 * 获取任务指定ID之后的所有chunk
	 * 从0开始
	 */
	async getSseEventsAfter(taskId: string, lastEventId: number): Promise<SseEventData[]> {
		const events = await this.getSseTaskEvents(taskId);
		return events.filter(event => event.id > lastEventId);
	}
}
