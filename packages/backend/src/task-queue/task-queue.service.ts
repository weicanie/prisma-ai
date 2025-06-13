import { Inject, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { EventBusService, EventList } from '../EventBus/event-bus.service';
import { RedisService } from '../redis/redis.service';

/**
 * 任务状态枚举
 */
export enum TaskStatus {
	PENDING = 'pending', // 等待执行
	RUNNING = 'running', // 正在执行

	COMPLETED = 'completed', // 执行完成
	FAILED = 'failed', // 执行失败
	ABORTED = 'aborted' // 被中止
}

/**
 * 持久化任务项接口
 */
export interface PersistentTask {
	id: string; // 任务唯一标识
	sessionId: string; // 关联的会话ID
	userId: string; // 关联的用户ID
	resultKey?: string; // 任务结果的Redis键

	type: string; // 任务类型

	status: TaskStatus; // 任务状态
	createdAt: number; // 创建时间
	startedAt?: number; // 开始执行时间
	finishedAt?: number; // 结束时间

	error?: string; // 错误信息
	metadata?: any; // 任务元数据
}

/**
 * 请求队列，支持Redis持久化、恢复
 *
 * 任务添加和运行逻辑：
 * 	先添加具体任务类型的处理函数,再添加任务到队列
 * 	任务处理函数（得是异步函数!）会在任务被取出时执行：handler(task)
 *
 * 任务队列持久化和恢复逻辑
 * 	在内存中和Redis中都维护同一个任务队列
 * 	服务重启时从Redis中恢复任务队列,并重新运行服务挂掉时正在运行中和没运行的任务
 */
@Injectable()
export class TaskQueueService {
	@Inject(EventBusService)
	EventBusService: EventBusService;

	private readonly logger = new Logger(TaskQueueService.name);

	/* 任务队列（内存中）：储存任务id */
	private queue: string[] = [];
	/* 任务处理器表（内存中）：任务类型-> 要执行的函数 */
	private readonly taskHandlers: Map<string, (task: PersistentTask) => Promise<void>> = new Map();
	/* 当前执行数 */
	private activeCount = 0;
	/* 最大并发数 */
	private readonly maxConcurrent = 5;

	// redis键前缀
	public readonly PREFIX = {
		/* 任务队列（redis中） */
		QUEUE: 'task_queue:',
		TASK: 'task:', // 任务详情
		RESULT: 'task_result:', // 任务结果

		/* 映射关系
		任务上下文
		taskId -> sessionId -> sessionData
		taskId -> metadata
		*/
		USER_TASKS: 'user_tasks:', // 用户任务映射
		SESSION_TASK: 'session_task:' // 会话任务映射
	};

	// 任务过期时间（24小时）
	public readonly TASK_TTL = 24 * 60 * 60;

	constructor(private readonly redisService: RedisService) {
		// 注册默认任务处理器
		this.registerTaskHandler('default', async task => {
			this.logger.log(`对${task.type}任务${task.id}执行默认任务处理器`);
			// 默认处理器不做任何事情，需要注册具体任务类型的处理器
		});
	}

	//FIXME llm生成任务恢复时会重新生成,但redis中的状态存在污染,需要在启动时清空
	/**
	 * 服务初始化，从redis恢复队列状态
	 */
	async initialize() {
		try {
			// 从redis中获得所有任务
			const queueKey = `${this.PREFIX.QUEUE}main`;
			const queueAll = await this.redisService.getClient().lRange(queueKey, 0, -1);
			this.queue = [];
			// 仅重新入队未完成的任务（running、pending）
			for (let i = 0; i < queueAll.length; i++) {
				const taskId = queueAll[i];
				const task = await this.getTask(taskId);
				if (task && (task.status === TaskStatus.PENDING || task.status === TaskStatus.RUNNING)) {
					this.logger.log(`重新入队未完成任务: ${task.id}`);
					await this.requeueTask(task.id);
				}
			}

			// 开始处理队列
			this.processQueue();
		} catch (error) {
			this.logger.error('初始化队列服务失败:', error);
		}
	}

	/**
	 * 处理队列中的任务
	 */
	private processQueue() {
		if (this.queue.length === 0 || this.activeCount >= this.maxConcurrent) {
			return;
		}

		// 从队列取出一个任务ID
		const taskId = this.queue.shift();
		if (!taskId) return;

		this.activeCount++;

		// 获取并执行任务
		this.getTask(taskId)
			.then(task => {
				if (!task) {
					this.logger.warn(`任务不存在: ${taskId}`);
					this.activeCount--;
					this.processQueue();
					return;
				}

				// 更新任务状态
				task.status = TaskStatus.RUNNING;
				task.startedAt = Date.now();
				this.saveTask(task)
					.then(() => {
						// 获取任务处理器
						const handler = this.taskHandlers.get(task.type) || this.taskHandlers.get('default');
						if (!handler) {
							throw new Error(`未找到${task.type}任务类型的处理器 `);
						}
						this.logger.log(`任务执行: ${taskId}`, task);
						// 执行任务
						return handler(task)
							.then(async () => {
								// 任务成功完成
								const updatedTask = await this.getTask(taskId);
								if (updatedTask) {
									updatedTask.status = TaskStatus.COMPLETED;
									updatedTask.finishedAt = Date.now();
									await this.saveTask(updatedTask);
									console.log('任务完成:', updatedTask);
									// 发出任务完成事件
									this.EventBusService.emit(EventList.taskCompleted, { task: updatedTask });
								}
							})
							.catch(async error => {
								// 任务执行失败
								this.logger.error(`任务执行失败: ${taskId}`, error);

								const updatedTask = await this.getTask(taskId);
								if (updatedTask) {
									updatedTask.status = TaskStatus.FAILED;
									updatedTask.error = error.message;
									updatedTask.finishedAt = Date.now();
									await this.saveTask(updatedTask);

									// 发出任务失败事件
									this.EventBusService.emit(EventList.taskFailed, { task: updatedTask, error });
								}
							});
					})
					.catch(error => {
						this.logger.error(`更新任务状态失败: ${taskId}`, error);
					})
					.finally(() => {
						this.activeCount--;
						this.processQueue(); // 处理下一个任务
					});
			})
			.catch(error => {
				this.logger.error(`获取任务失败: ${taskId}`, error);
				this.activeCount--;
				this.processQueue();
			});
	}

	/**
	 * 注册特定任务类型的处理器
	 * @param taskType 任务类型
	 * @param handler 处理函数
	 */
	registerTaskHandler(taskType: string, handler: (task: PersistentTask) => Promise<void>): void {
		this.taskHandlers.set(taskType, handler);
		this.logger.log(`已注册任务处理器: ${taskType}`);
	}

	/**
	 * 创建新任务
	 * @param sessionId 会话ID
	 * @param userId 用户ID
	 * @param taskType 任务类型
	 * @param metadata 任务元数据
	 * @returns 任务对象
	 */
	async createAndEnqueueTask(
		sessionId: string,
		userId: string,
		taskType: string,
		metadata?: any
	): Promise<PersistentTask> {
		// 检查会话是否已有关联任务
		const existingTaskId = await this.getSessionTaskId(sessionId);
		if (existingTaskId) {
			const existingTask = await this.getTask(existingTaskId);
			if (existingTask) {
				// 任务仍在进行中，直接返回
				if ([TaskStatus.PENDING, TaskStatus.RUNNING].includes(existingTask.status as TaskStatus)) {
					return existingTask;
				}
				// 任务已完成，移除旧任务关联
				await this.removeSessionTaskMapping(sessionId);
			}
		}

		// 创建新任务
		const taskId = crypto.randomUUID();
		const task: PersistentTask = {
			id: taskId,
			sessionId,
			userId,
			type: taskType,
			status: TaskStatus.PENDING,
			createdAt: Date.now(),
			metadata
		};

		// 保存任务
		await this.saveTask(task);

		// 关联会话和任务
		await this.setSessionTaskId(sessionId, taskId);

		// 关联用户和任务
		await this.addUserTask(userId, taskId);

		// 将任务加入队列
		await this.enqueueTask(taskId);

		return task;
	}

	/**
	 * 将任务ID加入Redis队列
	 */
	private async enqueueTask(taskId: string): Promise<void> {
		// 内存队列
		this.queue.push(taskId);

		// Redis队列（用于持久化）
		const queueKey = `${this.PREFIX.QUEUE}main`;
		await this.redisService.getClient().lPush(queueKey, taskId);
		await this.redisService.getClient().expire(queueKey, this.TASK_TTL);
		// 开始处理队列
		this.processQueue();
	}
	/**
	 * 保存任务
	 */
	async saveTask(task: PersistentTask): Promise<void> {
		const key = `${this.PREFIX.TASK}${task.id}`;
		await this.redisService.set(key, JSON.stringify(task), this.TASK_TTL);
	}
	/**
	 * 从Redis获取任务
	 */
	async getTask<T = PersistentTask>(taskId: string): Promise<T | null> {
		const key = `${this.PREFIX.TASK}${taskId}`;
		const data = await this.redisService.getClient().get(key);

		if (!data) return null;

		try {
			return JSON.parse(data);
		} catch (error) {
			this.logger.error(`解析任务数据失败: ${taskId}`, error);
			return null;
		}
	}
	/**
	 * 获取会话关联的任务的ID
	 */
	async getSessionTaskId(sessionId: string): Promise<string | null> {
		const key = `${this.PREFIX.SESSION_TASK}${sessionId}`;
		return await this.redisService.getClient().get(key);
	}
	/**
	 * 中止任务
	 */
	async abortTask(taskId: string): Promise<boolean> {
		const task = await this.getTask(taskId);
		if (!task) return false;

		if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.FAILED) {
			return false; // 已完成或失败的任务不能中止
		}

		// 更新任务状态
		task.status = TaskStatus.ABORTED;
		task.finishedAt = Date.now();
		await this.saveTask(task);

		// 发出任务中止事件
		this.EventBusService.emit(EventList.taskAborted, { task });

		return true;
	}
	/**
	 * 重新将任务加入队列（用于恢复中断的任务）
	 */
	private async requeueTask(taskId: string): Promise<void> {
		const task = await this.getTask(taskId);
		if (!task) return;

		// 将状态重置为等待中
		task.status = TaskStatus.PENDING;
		await this.saveTask(task);

		// 重新加入队列
		await this.enqueueTask(taskId);
	}

	/**
	 * 查找特定状态的任务
	 */
	private async findTasksByStatus(status: TaskStatus): Promise<PersistentTask[]> {
		// 注意：这是一个简化实现，真实场景中应该使用Redis的搜索功能或建立索引
		// 这里使用scan遍历所有任务，在实际应用中可能效率较低

		const tasks: PersistentTask[] = [];
		let curCursor = '0';

		do {
			const { cursor: nextCursor, keys } = await this.redisService
				.getClient()
				.scan(curCursor, { MATCH: `${this.PREFIX.TASK}*` });

			curCursor = nextCursor;

			if (keys.length > 0) {
				for (const key of keys) {
					const data = await this.redisService.getClient().get(key);
					if (data) {
						try {
							const task = JSON.parse(data) as PersistentTask;
							if (task.status === status) {
								tasks.push(task);
							}
						} catch (error) {
							this.logger.error(`解析任务数据失败: ${key}`, error);
						}
					}
				}
			}
		} while (curCursor !== '0');

		return tasks;
	}

	/**
	 * 关联会话和任务
	 */
	private async setSessionTaskId(sessionId: string, taskId: string): Promise<void> {
		const key = `${this.PREFIX.SESSION_TASK}${sessionId}`;
		await this.redisService.set(key, taskId, this.TASK_TTL);
	}

	/**
	 * 删除会话与任务的关联
	 */
	private async removeSessionTaskMapping(sessionId: string): Promise<void> {
		const key = `${this.PREFIX.SESSION_TASK}${sessionId}`;
		await this.redisService.getClient().del(key);
	}

	/**
	 * 将任务ID添加到用户的任务集合中
	 */
	private async addUserTask(userId: string, taskId: string): Promise<void> {
		const key = `${this.PREFIX.USER_TASKS}${userId}`;
		await this.redisService.getClient().sAdd(key, taskId);
		await this.redisService.getClient().expire(key, this.TASK_TTL);
	}

	/**
	 * 获取队列长度
	 */
	getQueueLength(): number {
		return this.queue.length;
	}

	/**
	 * 获取当前活跃任务数
	 */
	getActiveCount(): number {
		return this.activeCount;
	}
}
