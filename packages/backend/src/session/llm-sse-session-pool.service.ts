import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LLMSessionRequest } from '@prisma-ai/shared';
import { RedisService } from '../redis/redis.service';

interface SseSessionData {
	context?: any; // 存储两步请求中的上下文
	done?: boolean; // 标记要传输的数据是否生成完毕（后端是否完成会话）
	fontendDone?: boolean; // 标记前端是否完成会话（完成了SSE数据流的接收333333333）
}
interface LLMSseSessionData extends SseSessionData {
	context?: LLMSessionRequest; // 存储两步请求中的上下文
	done?: boolean; // 标记内容是否生成完毕（后端是否完成会话）
	fontendDone?: boolean; // 标记前端是否完成会话（完全接收SSE的数据流）
}

/* 会话管理
规定：一个用户同一时间只能进行一次会话（llm对话）,对应一个唯一的sessionId
	服务器生成sessionId并储存、返回给前端进行持久化

避免会话重复建立：
	1.一个用户同时只能有一个会话（userId -> sessionId）, 会话正常结束时双端删除
		服务器：设置 userId -> '', 保留 sessionId-> session（1天后自动删除）来支持客户端恢复会话
		客户端：删除sessionId
	2.会话过期时服务器自动删除会话, 客户端在使用会话前先检查会话是否可恢复、再检查会话是否存在、最后才新建会话
		对应服务端完成但客户端没完成、服务端和客户端都没完成、服务端和客户端都完成
			服务端没完成但客户端完成：客户端中断功能

*/

/**
 * 用户会话管理
 * userId -> sessionId -> session对象（SessionData）
 */
@Injectable()
export class LLMSseSessionPoolService implements OnModuleInit {
	// Redis键前缀
	private readonly KEY_PREFIX = 'session:llm:';
	// 会话过期时间(1天)
	private readonly SESSION_TTL = 24 * 60 * 60;

	constructor(private readonly redisService: RedisService) {}

	onModuleInit() {
		const logger = new Logger();
		logger.log('Redis会话池服务已初始化', 'SessionPoolService');
	}

	getKey(sessionId: string): string {
		return `${this.KEY_PREFIX}${sessionId}`;
	}
	/* 1、用户会话管理 userId -> sessionId */

	async setUserSessionId(userId: string, sessionId: string): Promise<void> {
		const key = this.getKey(userId);
		await this.redisService.set(key, sessionId, this.SESSION_TTL);
	}

	async getUserSessionId(userId: string): Promise<string | null> {
		const key = this.getKey(userId);
		const sessionId = await this.redisService.get(key);

		if (!sessionId) return null;

		return sessionId as string;
	}
	async delUserSessionId(userId: string) {
		const key = this.getKey(userId);
		await this.redisService.del(key);
	}
	/* 2、会话数据管理: sessionId -> session对象（SessionData） */
	async createSession(sessionId: string): Promise<LLMSseSessionData> {
		const session: LLMSseSessionData = {};

		await this.redisService.set(this.getKey(sessionId), JSON.stringify(session), this.SESSION_TTL);

		return session;
	}

	async getSession(sessionId: string): Promise<LLMSseSessionData | null> {
		const key = this.getKey(sessionId);
		const session = await this.redisService.get(key);

		if (!session) return null;

		try {
			return JSON.parse(session as string) as LLMSseSessionData;
		} catch (e) {
			console.error('解析会话数据失败:', e);
			return null;
		}
	}

	async deleteSession(sessionId: string): Promise<void> {
		const key = this.getKey(sessionId);
		await this.redisService.del(key);
	}
	async setContext(sessionId: string, context: any): Promise<void> {
		const key = this.getKey(sessionId);
		const session = await this.getSession(sessionId);

		if (session) {
			session.context = context;
			await this.redisService.set(key, JSON.stringify(session), this.SESSION_TTL);
		} else {
			const newSession: LLMSseSessionData = {
				context
			};
			await this.redisService.set(key, JSON.stringify(newSession), this.SESSION_TTL);
		}
	}
	async getContext(sessionId: string): Promise<LLMSessionRequest | null> {
		const session = await this.getSession(sessionId);
		return session?.context || null;
	}
	//* 为什么done有时标记不上
	/**
	 * 会话状态更新：标记后端完成SSE数据生成
	 */
	async setBackendDone(sessionId: string) {
		const key = this.getKey(sessionId);
		const session = await this.getSession(sessionId);

		if (session) {
			session.done = true;
			await this.redisService.set(key, JSON.stringify(session), this.SESSION_TTL);
		}
	}
	/**
	 * 会话状态更新：标记前端已完成SSE数据接收
	 */
	async setFrontendDone(sessionId: string) {
		const key = this.getKey(sessionId);
		const session = await this.getSession(sessionId);

		if (session) {
			session.fontendDone = true;
			await this.redisService.set(key, JSON.stringify(session), this.SESSION_TTL);
		}
	}
}
