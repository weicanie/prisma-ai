import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LLMSessionRequest, UserInfoFromToken } from '@prism-ai/shared';
import * as crypto from 'crypto';
import { RequireLogin, UserInfo } from '../decorator';
import { TaskQueueService } from '../task-queue/task-queue.service';
import { SessionPoolService } from './session-pool.service';
//TODO 需要 llm 缓存层, 对于相同、极度相似的prompt（通过向量计算相似度）, 只返回第一次生成的结果
//对于高度相似的prompt, 使用其回答作为上下文二次生成
//不仅可以节省token, 同时前端重复请求就算导致会话多次创建、也不会导致llm多次生成

@Controller('session')
export class SessionPoolController {
	constructor(
		private readonly sessionPool: SessionPoolService,
		private readonly taskQueueService: TaskQueueService
	) {}

	/* 创建新会话 */
	@RequireLogin()
	@Post('context')
	async createLLMSession(
		@Body() contextData: LLMSessionRequest,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		/* 确保一个用户同一时间只能进行一次会话（需要多类型再引入会话池,值变成表罢了）*/
		if (await this.sessionPool.getUserSessionId(userInfo.userId)) {
			return { sessionId: await this.sessionPool.getUserSessionId(userInfo.userId) };
		}
		try {
			/* 创建会话、存储上下文 */
			const sessionId = crypto.randomUUID();
			await this.sessionPool.createSession(sessionId);
			await this.sessionPool.setContext(sessionId, contextData);
			await this.sessionPool.setUserSessionId(userInfo.userId, sessionId);
			return { sessionId };
		} catch (error) {
			throw new Error('设置上下文失败');
		}
	}

	/* 
  前端在创建会话前,如localStorage的sessionId存在,需要获取当前会话状态再决策
    如不存在,则直接创建会话（说明还没进行过会话）

    获取会话状态
      服务端完成但客户端没完成、会话缓存没了：'notfound' 前端应该新建会话
			
      服务端完成但客户端没完成、会话缓存还在：'backdone' 前端应该请求断点续传

      服务端和客户端都没完成、创建了任务：'running' 前端应该请求断点续传
			服务端和客户端都没完成、没创建任务：'tasknotfound' 前端应该请求sse/generate接口创建任务

      服务端和客户端都完成：'bothdone' 前端应该新建会话

      x服务端没完成但客户端完成：用户主动中断

		后端是否完成：session.done或者task.status（统一用session.done）
  */
	@RequireLogin()
	@Get('status')
	async getSessionStatus(
		@Query('sessionId') sessionId: string,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		const existingSession = await this.sessionPool.getSession(sessionId);
		const curTaskId = await this.taskQueueService.getSessionTaskId(sessionId);
		console.log('🚀 ~ SessionPoolController ~ existingSession:', existingSession);
		if (!existingSession) return { status: 'notfound' };

		if (!curTaskId) return { status: 'tasknotfound' };
		if (existingSession.fontendDone && existingSession.done) return { status: 'bothdone' };

		if (existingSession.done) return { status: 'backdone' };

		return { status: 'running' };
	}

	/* 前端在接收完SSE数据后时上报
  会话的前端完成：设置会话为前端完成状态
  用户的会话释放：释放用户当前会话,可以进行新会话
  */
	@RequireLogin()
	@Get('frontend-over')
	async frontendOver(
		@Query('sessionId') sessionId: string,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		/* 前端完成 */
		await this.sessionPool.setFrontendDone(sessionId);
		/* 
      释放用户当前会话：删除userId ->sessionId的映射
      保留sessionId -> session的映射, 以供断点续传
    */
		await this.sessionPool.delUserSessionId(userInfo.userId);
		return '成功设置';
	}

	/* 用户主动中断 */
	@RequireLogin()
	@Get('abort')
	async abortSession() {
		//TODO中断功能
		//停止正在进行的生成、删除会话
	}
}
