import type {
	ContextInput,
	DataChunkErrVO,
	DataChunkVO,
	LLMSessionRequest,
	LLMSessionResponse,
	LLMSessionStatusResponse,
	ServerDataFormat as SDF,
	SsePipeUtil
} from '@prisma-ai/shared';
import { toast } from 'sonner';
import { instance } from '../config';
import type { SessionStatus } from './type';

class SseUtil implements SsePipeUtil {
	/* localStorage存储key */
	llmSessionKey = 'llmSessionId'; //会话id储存的key
	sessionStatusKey = 'llmSessionStatus'; //当前会话状态key（注意是当前会话的状态,新建的会话则需要新置状态）
	pathKey = 'llmSessionPath'; //当前会话对应的URL的path（用于断点接传）
	modelKey = 'llmSessionModel'; // 当前会话使用的模型（断点接传时不会使用，直接从redis拿数据）
	/**
	 *
	 * @param input 创建sse请求的上下文中的输入
	 * @param prevStatus 现存会话的状态
	 */
	async createLLMSessionContext(
		input: ContextInput,
		prevStatus: SessionStatus<LLMSessionStatusResponse>
	) {
		//更新现存会话的状态
		localStorage.setItem(this.sessionStatusKey, prevStatus);
		//新建会话
		const res = await instance.post<LLMSessionRequest, SDF<LLMSessionResponse>>(
			'llm-session/context',
			input
		);
		localStorage.setItem(this.llmSessionKey, res.data.data.sessionId);
		localStorage.setItem(this.sessionStatusKey, 'tasknotfound');
	}

	/* 当前会话状态 -> 决策 

getSessionStatusAndDecide的行为
	用户输入prompt（然后通过点击触发mutation.mutate、输入prompt调用）
		当前没有会话、'notfound'、'bothdone'：上传prompt作为上下文新建会话、设置当前会话状态为'tasknotfound'
		'backdone'、'running'、'tasknotfound' -> 什么都不做、提示当前会话正在进行中

	断点续传副作用（组件挂载时、输入''调用）：检查是否需要断点续传
	  'backdone'、'running' -> 设置状态为'backdone'、'running'以通知getSseData进行断点续传
		'notfound'、'tasknotfound'、'bothdone' -> 什么都不做
		
getSseData的行为
	'notfound'、'bothdone' -> 什么都不做
	'tasknotfound' -> 请求sse/generate 创建任务
	'backdone'、'running' -> 请求sse/generate-recover 进行断点续传
	
*/
	async getSessionStatusAndDecide(input: ContextInput | ''): Promise<SDF<string>> {
		/* 仅仅为了满足类型约束 */
		const forReturn = {
			code: '0',
			message: 'ok',
			data: ''
		};

		if (input) {
			/* 用户输入prompt后点击触发 */
			const sessionId = localStorage.getItem(this.llmSessionKey);
			if (sessionId) {
				const res = await instance.get<SDF<LLMSessionStatusResponse>>(
					`/llm-session/status?sessionId=${sessionId}`
				);
				const status = res.data.data.status;

				if (status === 'notfound' || status === 'bothdone') {
					await this.createLLMSessionContext(input, status);
				}

				if (status === 'backdone' || status === 'running' || status === 'tasknotfound') {
					toast.warning('当前会话正在进行中，请稍后再试');
				}
			} else {
				//目前无会话,新建会话
				await this.createLLMSessionContext(input, 'notfound');
			}
			return forReturn;
		} else {
			//input=''为进行断点接传的信号
			/* 断点续传副作用触发 */
			const sessionId = localStorage.getItem(this.llmSessionKey);
			if (sessionId) {
				const res = await instance.get<SDF<LLMSessionStatusResponse>>(
					`/llm-session/status?sessionId=${sessionId}`
				);
				const status = res.data.data.status;
				if (status === 'backdone' || status === 'running') {
					//断点续传信号
					localStorage.setItem(this.sessionStatusKey, status);
				}
				return forReturn;
			} else return forReturn;
		}
	}

	/**
	 * 通过EventSource请求特定接口获取SSE数据
	 * @param path 请求的URL路径,如 '/project/lookup'
	 * @param setDone 设置完成状态的函数，标记SSE数据传输是否结束
	 * @param setAnswering 设置 useSseAnswer 是否可以进行下一次SSE回答推送
	 * @returns 清理函数，用于关闭EventSource连接
	 */
	getSseData(
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
	) {
		// 每次前sse重置useSseAnswer状态
		setData('');
		setReasonContent('');
		setDone(false);
		setIsReasoning(true);

		setError(false);
		setErrorCode('');
		setErrorMsg('');

		let eventSource: EventSource | null = null;

		const setTupError = (code: string, msg: string) => {
			setError(true);
			setErrorCode(code);
			setErrorMsg(msg);
		};

		// 清理函数 - 关闭EventSource连接
		const cleanup = () => {
			if (eventSource) {
				eventSource.close();
				eventSource = null;
				setAnswering?.(false);
				/* 
			 让外部组件处理useSseAnswer状态的重置
			 因为外部组件会依赖useSseAnswer状态控制流程
			 且不重置也ok,每次新的sse此组件会在一开始重置
			*/
			}
		};

		// 验证用户登录状态
		const token = localStorage.getItem('token');
		if (!token) {
			setTupError('2006', '登录已过期，请重新登录');
			return cleanup;
		}

		// 验证会话是否存在
		const sessionId = localStorage.getItem(this.llmSessionKey);
		if (!sessionId) {
			return cleanup;
		}

		// 根据当前会话状态决策
		const status = localStorage.getItem(this.sessionStatusKey);

		// 如果会话已完成或不存在，不需要建立连接
		if (status === 'notfound' || status === 'bothdone') {
			return cleanup;
		}

		// 根据会话状态确定要请求的接口
		let url = '';
		const baseUrl = import.meta.env.VITE_API_BASE_URL; //协议-主机-端口

		if (status === 'backdone' || status === 'running') {
			// 断点接传 - 从上次中断的地方继续
			// 当前只会使用sessionId,model可选
			const sessionParam = `sessionId=${localStorage.getItem(this.llmSessionKey)}`;
			const tokenParam = `token=${token}`;
			const modelParam = model ? `&model=${model}` : '';
			url = `${baseUrl}${path}?${sessionParam}&${tokenParam}&recover=true${modelParam}`;
		} else if (status === 'tasknotfound') {
			// 创建新任务 - 开始新的生成
			const sessionParam = `sessionId=${localStorage.getItem(this.llmSessionKey)}`;
			const tokenParam = `token=${token}`;
			const modelParam = model ? `&model=${model}` : '';
			url = `${baseUrl}${path}?${sessionParam}&${tokenParam}${modelParam}`;
		} else return cleanup;

		try {
			// 创建连接
			eventSource = new EventSource(url);
			// 记录当前path和model,用于断点接传
			localStorage.setItem(this.pathKey, path);
			if (model !== undefined) {
				localStorage.setItem(this.modelKey, String(model));
			}

			// 处理服务器推送的消息
			eventSource.onmessage = event => {
				const eventData: DataChunkVO | DataChunkErrVO = JSON.parse(event.data as string);

				if (Object.prototype.hasOwnProperty.call(eventData?.data, 'error')) {
					cleanup();
					setTupError('9999', `chunk错误:${(eventData as DataChunkErrVO).data.error}`);
				}

				const chunk = (eventData as DataChunkVO).data;

				// 数据流式抵达
				if (chunk) {
					setData((dataState: string) => dataState + chunk.content || '');
					setReasonContent((reasonState: string) => reasonState + chunk.reasonContent || '');
				}

				if (chunk.isReasoning !== undefined) {
					// 更新推理状态
					setIsReasoning(chunk.isReasoning);
				}

				// 处理完成信号
				if (chunk.done) {
					// 上报后端：前端已完成接收
					this.frontendOver(sessionId);
					localStorage.setItem(this.sessionStatusKey, 'bothdone');

					setDone(true);
					cleanup();
				}
			};

			// 数据推送阶段的错误处理
			eventSource.onerror = event => {
				setDone(true);
				cleanup();
				toast.error('连接错误,请稍后重试');
				setTupError('9999', `连接错误,请稍后重试`);
				console.error('SSE连接错误:', event);
			};
		} catch (error) {
			// 连接创建阶段的错误处理
			setTupError('9999', `连接服务器失败，请稍后重试`);
			console.error('创建EventSource失败:', error);
			cleanup();
		}

		return cleanup;
	}

	/* 
报告后端前端的SSE会话已完成
 */
	async frontendOver(sessionId: string) {
		//上报前端完成
		const res = await instance.get<SDF<string>>(`llm-session/frontend-over?sessionId=${sessionId}`);
		return res;
	}
	/**
	 * 释放后端用户llm会话
	 * @param sessionId 会话id
	 */
	async freeSession(sessionId: string) {
		const res = await instance.get<SDF<string>>(`llm-session/free-session?sessionId=${sessionId}`);
		return res;
	}
}

const sseUtil = new SseUtil();

export { sseUtil };
