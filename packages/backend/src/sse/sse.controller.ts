import { Controller, Query, Sse } from '@nestjs/common';
import { DataChunk, UserInfoFromToken } from '@prism-ai/shared';
import { Observable } from 'rxjs';
import { RequireLogin, UserInfo } from '../decorator';
import { EventBusService, EventList } from '../EventBus/event-bus.service';
import { SessionPoolService } from '../session/session-pool.service';
import { TaskQueueService, TaskStatus } from '../task-queue/task-queue.service';
import { SseService } from './sse.service';

/* 在前端由于错误被优先处理因此和DataChunk兼容 */
interface ErrorChunk {
	data: {
		error?: string; // 错误信息
		done: boolean; // 是否完成
	};
}

//TODO 需要 llm 缓存层, 对于相同、极度相似的prompt（通过向量计算相似度）, 只返回第一次生成的结果
//对于高度相似的prompt, 使用其回答作为上下文二次生成
//不仅可以节省token, 同时前端重复请求就算导致会话多次创建、也不会导致llm多次生成
//FIXME 但是deepseek 本身就有缓存

@Controller('sse')
export class SseController {
	constructor(
		private readonly sessionPool: SessionPoolService,
		private readonly taskQueueService: TaskQueueService,
		private readonly sseService: SseService,
		private eventBusService: EventBusService
	) {}

	/* 启动llm生成
    前端确保在调用此接口前,检查会话状态、新会话才能调用此接口
    这是为了避免llm重复生成
  */
	@RequireLogin()
	@Sse('project-generate')
	async generate(@Query('sessionId') sessionId: string, @UserInfo() userInfo: UserInfoFromToken) {
		const curTaskId = await this.taskQueueService.getSessionTaskId(sessionId);
		/* 1、检查是否是新建的会话 */
		const existingSession = await this.sessionPool.getSession(sessionId);

		if (!existingSession) {
			return new Observable<ErrorChunk>(subscriber => {
				subscriber.next({
					data: { error: '用户sse会话不存在，请先创建会话', done: true }
				});
				subscriber.complete();
			});
		}

		if (curTaskId) {
			const taskCheck = await this.taskQueueService.getTask(curTaskId);
			if (
				taskCheck &&
				(taskCheck.status === TaskStatus.RUNNING || taskCheck.status === TaskStatus.PENDING)
			) {
				return new Observable<ErrorChunk>(subscriber => {
					subscriber.next({
						data: { error: '用户sse会话已存在,请请求断点续传接口', done: true }
					});
					subscriber.complete();
				});
			}
		}

		/* 2、校验上下文是否完整,prompt即储存在上下文中 */
		const context = await this.sessionPool.getContext(sessionId);
		if (!context || !context.input) {
			return new Observable<ErrorChunk>(subscriber => {
				subscriber.next({
					data: { error: '用户sse上下文不完整', done: true }
				});
				subscriber.complete();
			});
		}

		/* 3、创建task并入队 */
		const task = await this.sseService.createAndEnqueueTaskProject(sessionId, userInfo);

		/* 4、订阅任务的chunk生成事件并返回数据 */
		return new Observable<DataChunk>(subscriber => {
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
	/* 断点续传 */
	@RequireLogin()
	@Sse('generate-recover')
	async generateRevover(
		@Query('sessionId') sessionId: string,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		/* 校验会话 */
		const existingSession = await this.sessionPool.getSession(sessionId);

		if (!existingSession) {
			return new Observable<ErrorChunk>(subscriber => {
				subscriber.next({
					data: { error: '用户sse会话不存在，请先创建会话', done: true }
				});
				subscriber.complete();
			});
		}
		const context = await this.sessionPool.getContext(sessionId);
		if (!context || !context.input) {
			return new Observable<ErrorChunk>(subscriber => {
				subscriber.next({
					data: { error: '用户sse上下文不完整', done: true }
				});
				subscriber.complete();
			});
		}
		/* 校验任务是否已存在 */
		const curTaskId = await this.taskQueueService.getSessionTaskId(sessionId);
		if (!curTaskId) {
			return new Observable<ErrorChunk>(subscriber => {
				subscriber.next({
					data: { error: '用户sse任务不存在，请先创建会话', done: true }
				});
				subscriber.complete();
			});
		}
		/* 断点续传情况1：服务端已生成完毕
        直接返回 
      */
		const curResult = await this.sseService.getSseTaskEvents(curTaskId);
		if (existingSession && existingSession.done) {
			return new Observable<DataChunk>(subscriber => {
				subscriber.next({
					data: { ...curResult }
				});
				subscriber.complete();
			});
		}
		/* 断点续传情况2：服务端还在生成
		
      一次性返回当前已生成的整体string,客户端进行整体替换而不是增量更新（大大简化）
			（而不是LastEventId之前的, 这参考了deepseek官网的实现）

      再订阅chunk生成事件
    */

		return new Observable<DataChunk>(subscriber => {
			/* 1、发送当前已生成的内容 */
			subscriber.next({
				data: { ...curResult }
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
