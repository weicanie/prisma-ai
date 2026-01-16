import { MessageSendDto } from '../aichat';
import { ProjectDto } from '../project';
import { MatchJobDto } from '../resume';
import { LLMSessionStatusResponse, UserFeedback } from './normal';

/**
 * 控制式 Hook：通过 start/cancel 明确触发/终止一次 LLM(Natrual Language Process) 流式会话
 * - 不再依赖 props 改变自动启动，避免渲染阶段副作用触发
 */
interface SsePipeHookReturn {
	content: string;
	reasonContent: string;
	done: boolean;
	isReasoning: boolean;
	error: boolean;
	errorCode: string;
	errorMsg: string;
	answering: boolean;
	start: ({ path, input, model }: StartParams) => Promise<void>;
	cancel: () => void;
}

type SsePipeHook = (initialDoneStatus?: boolean) => SsePipeHookReturn;

/**
 * 创建sse请求的上下文中的输入
 * @description ProjectDto 项目经验服务
 * @description MatchJobDto 简历匹配岗位服务
 */
type ContextInput = {
	input: ProjectDto | MatchJobDto | MessageSendDto;
	userFeedback?: UserFeedback;
};
/**
 * 提取会话状态
 */
type SessionStatus<T> = T extends { status: infer R } ? R : unknown;

/**
 * 控制式 Hook：通过 start/cancel 明确触发/终止一次 LLM(Natrual Language Process) 流式会话
 * - 不再依赖 props 改变自动启动，避免渲染阶段副作用触发
 */
type StartParams = {
	path: string; // 请求的URL路径，如 '/project/lookup'
	input: ContextInput; // 后端方法的输入
	model: string; // 选择的模型
};

interface SsePipeUtil {
	llmSessionKey: string;
	sessionStatusKey: string;
	pathKey: string;
	modelKey: string;
	createLLMSessionContext: (
		input: ContextInput,
		prevStatus: SessionStatus<LLMSessionStatusResponse>
	) => Promise<void>;
	getSessionStatusAndDecide: (input: ContextInput | '') => Promise<any>;
	getSseData: (
		path: string,
		model: string | undefined,
		setData: (data: string | ((prevData: string) => string)) => void,
		setReasonContent: (data: string | ((prevData: string) => string)) => void,
		setDone: (done: boolean) => void,
		setIsReasoning: (isReasoning: boolean) => void,
		setError: (error: boolean) => void,
		setErrorCode: (code: string) => void,
		setErrorMsg: (msg: string) => void,
		setAnswering?: (answering: boolean) => void
	) => () => void;
	frontendOver: (sessionId: string) => Promise<any>;
	freeSession: (sessionId: string) => Promise<any>;
}

export type { ContextInput, SessionStatus, SsePipeHook, SsePipeUtil, StartParams };
