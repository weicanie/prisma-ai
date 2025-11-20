import { type Observable } from 'rxjs';
import { UserInfoFromToken } from '../login_regist';
import { SelectedLLM } from '../project';
import {
	DataChunkErrVO,
	DataChunkVO,
	LLMSessionRequest,
	StreamingChunk as LLMStreamingChunk,
	UserFeedback
} from './normal';

/**
 * 流式返回llm输出的函数
 */
type SseFunc = (
	input: any,
	userInfo: UserInfoFromToken,
	taskId: string,
	userFeedback: UserFeedback,
	model: SelectedLLM //使用的llm
) => Promise<Observable<LLMStreamingChunk>>;

/**
 * 提供sse数据源函数的service
 */
abstract class WithFuncPool {
	/**
	 * 函数池，key为函数名，value为函数实现
	 */
	abstract funcPool: Record<string, SseFunc>;
	/**
	 * 函数池名称，用于注册到任务管理器
	 */
	abstract poolName: string;
	/**
	 * 初始化函数池，将函数实现绑定到this
	 */
	abstract initFuncPool(): void;
	/**
	 * 模块初始化时调用，将函数池注册到任务管理器
	 */
	abstract onModuleInit(): void;
}

/**
 * SSE会话数据
 */
interface SseSessionData {
	context?: any; // 存储两步请求中的上下文
	done?: boolean; // 标记要传输的数据是否生成完毕（后端是否完成会话）
	fontendDone?: boolean; // 标记前端是否完成会话（完成了SSE数据流的接收）
}
interface LLMSseSessionData extends SseSessionData {
	context?: LLMSessionRequest; // 存储两步请求中的上下文
	done?: boolean; // 标记内容是否生成完毕（后端是否完成会话）
	fontendDone?: boolean; // 标记前端是否完成会话（完全接收SSE的数据流）
}

/**
 * SSE管道管理器
 * @description SSE管道：由会话id标识的SSE数据流管道
 * @description SSE管道的生命周期：创建 -> 传输 -> 后端数据传输完毕 -> 前端数据接收完毕 -> 结束
 */
interface SsePipeManager {
	pools: Record<string, WithFuncPool>;
	registerFuncPool(pool: WithFuncPool): void;
	onModuleInit(): void;
	handleSseRequestAndResponse: (
		sessionId: string,
		userInfo: UserInfoFromToken,
		metadata: any
	) => Promise<Observable<DataChunkVO | DataChunkErrVO>>;
	handleSseRequestAndResponseRecover: (
		sessionId: string,
		userInfo: UserInfoFromToken
	) => Promise<Observable<DataChunkVO | DataChunkErrVO>>;
}

/**
 * SSE管道控制器
 * @description 负责处理前端数据请求和异常恢复的接口
 */
interface SsePipeController {
	createLLMSession: (
		contextData: LLMSessionRequest,
		userInfo: UserInfoFromToken
	) => Promise<{ sessionId: string | null }>;
	getSessionStatus: (sessionId: string, userInfo: UserInfoFromToken) => Promise<{ status: string }>;
	frontendOver: (sessionId: string, userInfo: UserInfoFromToken) => Promise<string>;
	freeSession: (sessionId: string, userInfo: UserInfoFromToken) => Promise<string>;
	abortSession: () => Promise<void>;
}

/**
 * SSE会话管理器
 * @description SSE会话：由会话id标识的会话
 */
interface SseSessionManager {
	onModuleInit(): void;
	getKey(sessionId: string): string;
	createSession: (sessionId: string) => Promise<LLMSseSessionData>;
	getSession: (sessionId: string) => Promise<LLMSseSessionData | null>;
	deleteSession: (sessionId: string) => Promise<void>;
	setContext: (sessionId: string, context: LLMSessionRequest) => Promise<void>;
	getContext: (sessionId: string) => Promise<LLMSessionRequest | null>;
	setBackendDone: (sessionId: string) => Promise<void>;
	setFrontendDone: (sessionId: string) => Promise<void>;
	setUserSessionId: (userId: string, sessionId: string) => Promise<void>;
	getUserSessionId: (userId: string) => Promise<string | null>;
	delUserSessionId: (userId: string) => Promise<void>;
}

/**
 * 提供缓存功能的服务/模块（如redis/内存）
 * @description 用于支持管道异常恢复
 */
interface RedisLike {
	get: (key: string) => Promise<string | null>;
	set: (key: string, value: string | number, ttl?: number) => Promise<void>;
	del: (key: string) => Promise<number>;
	getKeysByPattern: (pattern: string) => Promise<string[]>;
	ttl: (key: string) => Promise<number>;
	keys: (pattern: string) => Promise<string[]>;
	getClient: () => any;
}

export {
	LLMSseSessionData,
	RedisLike,
	SseFunc,
	SsePipeController,
	SsePipeManager,
	SseSessionManager,
	WithFuncPool
};
