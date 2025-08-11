import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
	DataChunkErrVO,
	DataChunkVO,
	LLMSessionRequest,
	SelectedLLM,
	UserInfoFromToken
} from '@prisma-ai/shared';
import { catchError, mergeMap, Observable, timeout } from 'rxjs';
import { EventBusService, EventList } from '../../EventBus/event-bus.service';
import { RedisService } from '../../redis/redis.service';
import { LLMSseSessionPoolService } from '../../session/llm-sse-session-pool.service';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { PersistentTask, TaskStatus } from '../../type/taskqueue';
import { WithFuncPool } from '../../utils/abstract';
import { LLMStreamingChunk, SseFunc } from '../../utils/type';
import { LLMCacheService } from './LLMCache.service';
/**
 * sse返回LLM生成内容的任务
 */
interface LLMSseTask extends PersistentTask {
	metadata: {
		funcKey: string;
		/**
		 * 用于通过funcKey找到对应的函数
		 * 该函数即为流式数据源
		 */
		poolName: string;
		model: SelectedLLM; //使用的llm
		cancelFn?: () => void;
	};
}

/**
 * redis中结果的存储形式
 */
export interface redisStoreResult {
	content: string; // 生成的内容
	reasonContent?: string; // 推理阶段的内容
	done: boolean; // 是否完成
	isReasoning?: boolean; // 是否是推理阶段
}

/* 

*/
/**
 * 用来给LLM业务模块提供sse响应数据能力
 * @description 使用方法:
 * 1、流式响应生成内容：handleSseRequestAndResponse方法
 * 2、断点接传：handleSseRequestAndResponseRecover方法
 * 其中func参数返回流式数据的且返回的chunk转换为LLMStreamingChunk即可
 */
@Injectable()
export class LLMSseService implements OnModuleInit {
	private readonly logger = new Logger(LLMSseService.name);

	/**
	 * 存储每个任务的chunk数组池
	 * 任务id -> chunk数组
	 */
	chunkArrayPool: Record<string, LLMStreamingChunk[]> = {};

	/**
	 * 任务类型字段,用于指定任务处理器
	 */
	taskType = {
		project: 'sse_llm'
	};

	/**
	 * 提供数据源函数的service
	 */
	pools: Record<string, WithFuncPool> = {};

	constructor(
		private taskQueueService: TaskQueueService,
		private eventBusService: EventBusService,
		private redisService: RedisService,
		private readonly sessionPool: LLMSseSessionPoolService,
		private readonly llmCache: LLMCacheService,
		@Inject('WithFuncPoolProjectProcess') private readonly withFuncPoolProjectProcess: WithFuncPool,
		@Inject('WithFuncPoolResumeService') private readonly withFuncPoolResumeService: WithFuncPool
	) {
		/* 注册任务处理器 */
		try {
			this.taskQueueService.registerTaskHandler(this.taskType.project, this.taskHandler.bind(this));
		} catch (error) {
			this.logger.error(`SSE任务处理器注册失败: ${error}`);
			throw error;
		}
		this.logger.log(`SSE任务处理器已注册: ${this.taskType.project}`);
	}

	onModuleInit() {
		this.pools[this.withFuncPoolProjectProcess.poolName] = this.withFuncPoolProjectProcess;
		this.pools[this.withFuncPoolResumeService.poolName] = this.withFuncPoolResumeService;
	}

	/* sse数据推送任务处理器
  核心逻辑：llm边生成、边往http连接推送数据、边存入redis中的taskid标识的event数组
    支持数据获取和断点续传逻辑：接口通过订阅 chunkGenerated事件 返回数据给前端、处理可能的断点续传

  注意：返回的是Observable对象,用一个Promise对象包裹使其内部逻辑得到执行
    因为taskQueueService里不应该放具体执行逻辑, 这样做taskQueueService里只用处理Promise对象
  */
	private async taskHandler(task: LLMSseTask): Promise<void> {
		const { sessionId, userId, id: taskId, metadata } = task;

		/* 获取上下文,其含有input和userInfo、userFeedback */
		const context = await this.sessionPool.getContext(sessionId);
		if (!context || !context.input) {
			throw new Error('会话上下文不完整，请先创建会话');
		}
		/* 调用llm开启流式传输 */
		const func: SseFunc = this.pools[metadata.poolName].funcPool[metadata.funcKey];
		const observable = await func(
			context.input,
			context.userInfo!,
			taskId,
			context.userFeedback ?? { reflect: false, content: '' },
			metadata.model
		);
		/* 返回一个Promise，该Promise在该Observable完成时才会解析 */
		return new Promise<void>((resolve, reject) => {
			/* 创建订阅 */
			const subscription = observable
				.pipe(
					mergeMap(async (chunk: LLMStreamingChunk) => {
						if (chunk) {
							console.log('🚀 ~ LLMSseService ~ mergeMap ~ chunk:', chunk);
							/* 储存到redis、发送chunk抵达事件 */
							await this.saveSseEventData(taskId, chunk);
						}

						/* 服务端完成
            删除userId ->sessionId的映射,释放用户会话
            保留sessionId -> session的映射, 以供客户端恢复
            */
						if (chunk.done) {
							try {
								await this.sessionPool.delUserSessionId(userId);
							} catch (error) {
								console.error(error);
							}
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
						this.logger.error('SSE任务执行错误:', error);
						await this.sessionPool.setBackendDone(sessionId);
						await this.sessionPool.setFrontendDone(sessionId);
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
	//* 调试llm缓存功能
	/* 请求先过llm缓存 
      对于相同的prompt, 直接返回
      对于高度相似的prompt, 使用其回答作为上下文二次生成（prompt设计：问ai、上hub）
      不仅可以节省token, 同时前端重复请求就算导致会话多次创建、也不会导致llm多次生成
   */
	private async throughLLMCache(context: LLMSessionRequest) {
		// step1: 检查完全匹配的缓存
		const exactCacheResult = await this.llmCache.checkExactCache(context);
		if (exactCacheResult) {
			// 模拟流式传输缓存结果
			return this.llmCache.createCachedResponse(exactCacheResult);
		}
		// step2: 检查高度相似的缓存
		const similarCacheResult = await this.llmCache.getSimilarCacheResult(context);
		if (similarCacheResult) {
			// 如果相似度非常高(>0.95)，直接返回缓存结果
			if (similarCacheResult.similarity > 0.95) {
				return this.llmCache.createCachedResponse(similarCacheResult.result, true);
			}
		}
	}

	/** 工具-将当前生成的chunk储存到redis中-专门用于处理llm(deepseek)生成
	 * 事件处理器内部调用
	 */
	private async saveSseEventData(taskId: string, chunk: LLMStreamingChunk): Promise<void> {
		const task = await this.taskQueueService.getTask<LLMSseTask>(taskId);
		if (!task) {
			throw new Error(`任务不存在: ${taskId}`);
		}
		// 发出chunk抵达事件
		this.eventBusService.emit(EventList.chunkGenerated, {
			taskId,
			eventData: chunk
		});

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

	/* 创建任务并入队 */
	private async createAndEnqueueTaskProject(
		sessionId: string,
		userInfo: UserInfoFromToken,
		metadata: LLMSseTask['metadata']
	) {
		const task = await this.taskQueueService.createAndEnqueueTask(
			sessionId,
			userInfo.userId,
			this.taskType.project,
			metadata
		);
		return task;
	}

	/** 工具-断点接传接口调用-当还在生成时调用-此时chunk储存在chunkArrayPool而不是redis中
	 * 获取任务已生成的所有chunk
	 */
	private async getLLMSseTaskEvents(taskId: string): Promise<redisStoreResult> {
		const chunkArray = this.chunkArrayPool[taskId];
		if (!chunkArray) {
			throw new Error(`任务${taskId}不存在`);
		}
		const lastChunk = chunkArray[chunkArray.length - 1];
		const result = {
			content: chunkArray.reduce((prev, cur) => {
				return prev + (cur.content || '');
			}, ''),
			reasonContent: chunkArray.reduce((prev, cur) => {
				return prev + (cur.reasonContent || '');
			}, ''),
			done: lastChunk.done,
			isReasoning: lastChunk.isReasoning
		};
		return result;
	}
	/** 流式响应生成内容
	 *
	 * @param sessionId 会话id
	 * @param userInfo Guard 提取的用户信息
	 * @param func 返回sse数据的函数
	 */
	async handleSseRequestAndResponse(
		sessionId: string,
		userInfo: UserInfoFromToken,
		metadata: LLMSseTask['metadata']
	) {
		/* 1、检查是否已建立会话 */
		const existingSession = await this.sessionPool.getSession(sessionId);

		if (!existingSession) {
			return new Observable<DataChunkErrVO>(subscriber => {
				subscriber.next({
					data: { error: '用户sse会话不存在，请先创建会话', done: true }
				});
				subscriber.complete();
			});
		}
		/* 2、检查会话任务是否已存在 */
		const curTaskId = await this.taskQueueService.getSessionTaskId(sessionId);
		//FIXME 任务完成但结果缓存已清理的情况,当二者过期时间不一致时
		if (curTaskId) {
			const taskCheck = await this.taskQueueService.getTask(curTaskId);
			if (
				taskCheck &&
				(taskCheck.status === TaskStatus.RUNNING ||
					taskCheck.status === TaskStatus.PENDING ||
					taskCheck.status === TaskStatus.COMPLETED)
			) {
				return new Observable<DataChunkErrVO>(subscriber => {
					subscriber.next({
						data: { error: '用户sse会话已存在,请请求断点接传接口', done: true }
					});
					subscriber.complete();
				});
			}
		}

		/* 2、校验上下文是否完整,input即储存在上下文中 */
		const context = await this.sessionPool.getContext(sessionId);
		if (!context || !context.input) {
			return new Observable<DataChunkErrVO>(subscriber => {
				subscriber.next({
					data: { error: '用户sse上下文不完整', done: true }
				});
				subscriber.complete();
			});
		}

		/* 3、创建task并入队 */
		const task = await this.createAndEnqueueTaskProject(sessionId, userInfo, metadata);

		/* 4、订阅任务的chunk生成事件并返回数据 */
		return new Observable<DataChunkVO>(subscriber => {
			this.eventBusService.on(EventList.chunkGenerated, async ({ taskId, eventData: chunk }) => {
				if (taskId === task.id) {
					if (chunk.done) {
						subscriber.next({
							data: { ...chunk }
						});
						subscriber.complete();
					} else {
						subscriber.next({
							data: { ...chunk }
						});
					}
				}
			});
			//结束逻辑在上面的回调中应该已被处理
			this.eventBusService.on(EventList.taskCompleted, async ({ task }) => {
				const taskId = task.id;
				if (taskId === task.id) {
					subscriber.complete();
				}
			});
		});
	}

	/** 断点接传
	 *
	 * @param sessionId 会话id
	 * @param userInfo Guard 提取的用户信息
	 */
	async handleSseRequestAndResponseRecover(sessionId: string, userInfo: UserInfoFromToken) {
		/* 校验会话 */
		const existingSession = await this.sessionPool.getSession(sessionId);

		if (!existingSession) {
			return new Observable<DataChunkErrVO>(subscriber => {
				subscriber.next({
					data: { error: '用户sse会话不存在，请先创建会话', done: true }
				});
				subscriber.complete();
			});
		}
		const context = await this.sessionPool.getContext(sessionId);
		if (!context || !context.input) {
			return new Observable<DataChunkErrVO>(subscriber => {
				subscriber.next({
					data: { error: '用户sse上下文不完整', done: true }
				});
				subscriber.complete();
			});
		}
		/* 校验任务是否已存在 */
		const curTaskId = await this.taskQueueService.getSessionTaskId(sessionId);
		if (!curTaskId) {
			return new Observable<DataChunkErrVO>(subscriber => {
				subscriber.next({
					data: { error: '用户sse任务不存在，请先创建会话', done: true }
				});
				subscriber.complete();
			});
		}
		/* 断点接传情况1：服务端已生成完毕
            直接返回 
      */
		const curResult = await this.getLLMSseTaskEvents(curTaskId);
		if (existingSession && existingSession.done) {
			return new Observable<DataChunkVO>(subscriber => {
				subscriber.next({
					data: { ...curResult }
				});
				subscriber.complete();
			});
		}
		/* 断点接传情况2：服务端还在生成
        
      一次性返回当前已生成的整体string,客户端进行整体替换而不是增量更新（大大简化）
        （而不是LastEventId之前的, 这参考了deepseek官网的实现）
    
        再订阅chunk生成事件
      */

		return new Observable<DataChunkVO>(subscriber => {
			/* 1、发送当前已生成的内容 */
			process.nextTick(() => {
				subscriber.next({
					data: { ...curResult }
				});
			});

			/* 2、订阅内容并继续发送 */
			this.eventBusService.on(EventList.chunkGenerated, async ({ taskId, eventData: chunk }) => {
				if (taskId === curTaskId) {
					if (chunk.done) {
						subscriber.next({
							data: { ...chunk }
						});
						subscriber.complete();
					} else {
						subscriber.next({
							data: { ...chunk }
						});
					}
				}
			});
			//结束逻辑在上面的回调中应该已被处理
			this.eventBusService.on(EventList.taskCompleted, async ({ task }) => {
				const taskId = task.id;
				if (taskId === task.id) {
					subscriber.complete();
				}
			});
		});
	}
}
