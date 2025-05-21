import { Controller, Query, Sse } from '@nestjs/common';
import { DataChunk, UserInfoFromToken } from '@prism-ai/shared';
import { Observable } from 'rxjs';
import { RequireLogin, UserInfo } from '../decorator';
import { RedisService } from '../redis/redis.service';
import { SessionPoolService } from '../session/session-pool.service';
import { TaskQueueService } from '../task-queue/task-queue.service';
import { SseEventData, SseService } from './sse.service';

//TODO 需要 llm 缓存层, 对于相同、极度相似的prompt（通过向量计算相似度）, 只返回第一次生成的结果
//对于高度相似的prompt, 使用其回答作为上下文二次生成
//不仅可以节省token, 同时前端重复请求就算导致会话多次创建、也不会导致llm多次生成

@Controller('sse')
export class SseController {
	constructor(
		private readonly sessionPool: SessionPoolService,
		private readonly taskQueueService: TaskQueueService,
		private readonly sseService: SseService,
		private readonly redisService: RedisService
	) {}

	/* 启动llm生成
    前端确保在调用此接口前,检查会话状态、新会话才能调用此接口
    这是为了避免llm重复生成
  */
	@RequireLogin()
	@Sse('generate')
	async generate(@Query('sessionId') sessionId: string, @UserInfo() userInfo: UserInfoFromToken) {
		const curTaskId = await this.taskQueueService.getSessionTaskId(sessionId);
		/* 1、检查是否是新建的会话 */
		const existingSession = await this.sessionPool.getSession(sessionId);

		if (!existingSession) {
			return new Observable<DataChunk>(subscriber => {
				subscriber.next({
					data: { error: 'sse会话不存在，想空手套白狼?', done: true }
				});
				subscriber.complete();
			});
		}
		if (curTaskId) {
			return new Observable<DataChunk>(subscriber => {
				subscriber.next({
					data: { error: 'sse会话已存在，想吃回头草?', done: true }
				});
				subscriber.complete();
			});
		}

		/* 2、校验上下文是否完整,prompt即储存在上下文中 */
		const context = await this.sessionPool.getContext(sessionId);
		if (!context || !context.prompt) {
			return new Observable<DataChunk>(subscriber => {
				subscriber.next({
					data: { error: 'sse上下文不完整，想滥竽充数?', done: true }
				});
				subscriber.complete();
			});
		}
		/* 3、创建task并入队 */
		const task = await this.sseService.createAndEnqueueTask(sessionId, userInfo);

		/* 4、订阅任务的chunk生成事件并返回数据 */
		return new Observable<DataChunk>(subscriber => {
			this.taskQueueService.eventEmitter.on(
				'chunkGenerated',
				async (taskId: string, chunk: SseEventData) => {
					if (taskId === task.id) {
						subscriber.next({
							data: { content: chunk.content, done: false }
						});
					}
				}
			);
			this.taskQueueService.eventEmitter.on('taskCompleted', async (taskId: string) => {
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
			return new Observable<DataChunk>(subscriber => {
				subscriber.next({
					data: { error: 'sse会话不存在，请先创建会话', done: true }
				});
				subscriber.complete();
			});
		}
		const context = await this.sessionPool.getContext(sessionId);
		if (!context || !context.prompt) {
			return new Observable<DataChunk>(subscriber => {
				subscriber.next({
					data: { error: 'sse上下文不完整，想滥竽充数?', done: true }
				});
				subscriber.complete();
			});
		}
		/* 校验任务是否已存在 */
		const curTaskId = await this.taskQueueService.getSessionTaskId(sessionId);
		if (!curTaskId) {
			return new Observable<DataChunk>(subscriber => {
				subscriber.next({
					data: { error: 'sse任务不存在，请先创建会话', done: true }
				});
				subscriber.complete();
			});
		}
		/* 断点续传：服务端已生成完毕
        直接返回 
      */
		const curEvents = await this.sseService.getSseTaskEvents(curTaskId);
		const curContent = curEvents.reduce((acc, event) => acc + event.content, '');
		if (existingSession && existingSession.done) {
			return new Observable<DataChunk>(subscriber => {
				subscriber.next({
					data: { content: curContent, done: true }
				});
				subscriber.complete();
			});
		}
		/* 断点续传：服务端还在生成
		
      一次性返回当前已生成的整体string,客户端进行整体替换而不是增量更新（大大简化）
			（而不是LastEventId之前的, 这参考了deepseek官网的实现）

      再订阅chunk生成事件
    */

		return new Observable<DataChunk>(subscriber => {
			/* 1、发送当前已生成的内容 */
			subscriber.next({
				data: { content: curContent, done: false }
			});
			/* 2、订阅内容并继续发送 */
			this.taskQueueService.eventEmitter.on(
				'chunkGenerated',
				async (taskId: string, chunk: SseEventData) => {
					if (taskId === curTaskId) {
						subscriber.next({
							data: { content: chunk.content, done: false }
						});
					}
				}
			);
			this.taskQueueService.eventEmitter.on('taskCompleted', async (taskId: string) => {
				if (taskId === curTaskId) {
					subscriber.complete();
				}
			});
		});
	}
}
