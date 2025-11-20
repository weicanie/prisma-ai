import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
	DataChunkErrVO,
	DataChunkVO,
	type RedisLike,
	SelectedLLM,
	SseFunc,
	SsePipeManager,
	type SseSessionManager,
	StreamingChunk,
	UserInfoFromToken,
	WithFuncPool
} from '@prisma-ai/shared';
import { catchError, mergeMap, Observable, timeout } from 'rxjs';
import { EventBusService, EventList } from '../../EventBus/event-bus.service';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { PersistentTask, TaskStatus } from '../../type/taskqueue';
import { recordUserUseData } from '../../utils/userUseDataRecord';
/**
 * sse返回LLM生成内容的任务
 */
export interface LLMSseTask extends PersistentTask {
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
export class SseManagerService implements OnModuleInit, SsePipeManager {
	private readonly logger = new Logger(SseManagerService.name);

	/**
	 * 存储所有已注册的函数池
	 * poolName -> 服务实例
	 */
	public pools: Record<string, WithFuncPool> = {};

	/**
	 * 注册一个包含多个可执行函数的服务（池）
	 * @param pool 实现了 WithFuncPool 接口的服务实例
	 */
	registerFuncPool(pool: WithFuncPool) {
		if (this.pools[pool.poolName]) {
			this.logger.warn(`函数池 ${pool.poolName} 已存在，将被覆盖。`);
		}
		this.pools[pool.poolName] = pool;
		this.logger.log(`函数池 ${pool.poolName} 已注册。`);
	}

	/**
	 * 存储每个任务的chunk数组池
	 * 任务id -> chunk数组
	 */
	chunkArrayPool: Record<string, StreamingChunk[]> = {};

	/**
	 * 任务类型字段,用于指定任务处理器
	 */
	taskType = {
		project: 'sse_llm'
	};

	constructor(
		private taskQueueService: TaskQueueService,
		private eventBusService: EventBusService,
		@Inject('RedisLike')
		private redisService: RedisLike,
		@Inject('SseSessionManager')
		private readonly sessionPool: SseSessionManager
	) {}

	onModuleInit() {
		/* 注册任务处理器 */
		try {
			this.taskQueueService.registerTaskHandler(this.taskType.project, this.taskHandler.bind(this));
		} catch (error) {
			this.logger.error(`SSE任务处理器注册失败: ${error}`);
			throw error;
		}
		this.logger.log(`SSE任务处理器已注册: ${this.taskType.project}`);
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
		/**
		 * 如果存在用户反馈，则记录
		 */
		if (context.userFeedback?.reflect && context.userFeedback?.content) {
			recordUserUseData(context.userFeedback, {
				...context,
				userInfo: {
					...context.userInfo,
					userConfig: '已去除用户配置信息'
				}
			});
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
					mergeMap(async (chunk: StreamingChunk) => {
						if (chunk) {
							// this.logger.log(`SSE任务${taskId}生成chunk: ${chunk.content}`);
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

	/** 工具-将当前生成的chunk储存到redis中-专门用于处理llm(deepseek)生成
	 * 事件处理器内部调用
	 */
	private async saveSseEventData(taskId: string, chunk: StreamingChunk): Promise<void> {
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
			// 任务可能已完成，尝试从redis获取
			const task = await this.taskQueueService.getTask(taskId);
			if (task && task.resultKey) {
				const result = await this.redisService.get(task.resultKey);
				if (result) {
					return JSON.parse(result);
				}
			}
			throw new Error(`任务${taskId}不存在或已完成且缓存被清除`);
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
		//TODO 任务完成但结果缓存已清理的情况,当二者过期时间不一致时
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

		/* 校验上下文是否完整,input即储存在上下文中 */
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
			const onChunkGenerated = async ({ taskId, eventData: chunk }) => {
				if (taskId === task.id) {
					if (chunk.done) {
						subscriber.next({
							data: { ...chunk }
						});
						subscriber.complete();
						// 清理监听器
						this.eventBusService.off(EventList.chunkGenerated, onChunkGenerated);
					} else {
						subscriber.next({
							data: { ...chunk }
						});
					}
				}
			};

			this.eventBusService.on(EventList.chunkGenerated, onChunkGenerated);

			// 连接断开时的清理逻辑
			return () => {
				this.eventBusService.off(EventList.chunkGenerated, onChunkGenerated);
			};
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
		if (existingSession && existingSession.done) {
			const curResult = await this.getLLMSseTaskEvents(curTaskId);
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
			const onChunkGenerated = async ({ taskId, eventData: chunk }) => {
				if (taskId === curTaskId) {
					if (chunk.done) {
						subscriber.next({
							data: { ...chunk }
						});
						subscriber.complete();
						this.eventBusService.off(EventList.chunkGenerated, onChunkGenerated);
					} else {
						subscriber.next({
							data: { ...chunk }
						});
					}
				}
			};
			/* 1、发送当前已生成的内容 */
			this.getLLMSseTaskEvents(curTaskId)
				.then(curResult => {
					subscriber.next({
						data: { ...curResult, done: false } // 确保done为false，因为还在生成
					});
					/* 2、订阅内容并继续发送 */
					this.eventBusService.on(EventList.chunkGenerated, onChunkGenerated);
				})
				.catch(err => {
					subscriber.error({ data: { error: err.message, done: true } });
				});

			return () => {
				this.eventBusService.off(EventList.chunkGenerated, onChunkGenerated);
			};
		});
	}
}
