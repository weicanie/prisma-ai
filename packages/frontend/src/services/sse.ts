import type {
	DataChunk,
	LLMSessionRequest,
	LLMSessionResponse,
	LLMSessionStatusResponse,
	ServerDataFormat as SDF
} from '@prism-ai/shared';
import { message } from 'antd';
import { instance } from './config';
export const llmSessionKey = 'llmSessionId'; //会话id储存的key
export const sessionStatusKey = 'llmSessionStatus'; //当前会话状态key（注意是当前会话的状态,新建的会话则需要新置状态）

/* 当前会话状态 -> 决策 （ceateSession、useSseData）

getSessionStatusAndDecide的行为
	用户输入prompt（然后通过点击触发mutation.mutate、输入prompt调用）
		当前没有会话、'notfound'、'bothdone'：上传prompt作为上下文新建会话、设置当前会话状态为'tasknotfound'
		'backdone'、'running'、'tasknotfound' -> 什么都不做、提示当前会话正在进行中

	断点续传副作用（组件挂载时输入''调用）：检查是否需要断点续传
	  'backdone'、'running' -> 设置状态为'backdone'、'running'以通知useSseData进行断点续传
		'notfound'、'tasknotfound'、'bothdone' -> 什么都不做
		
getSseData的行为
	'notfound'、'bothdone' -> 什么都不做
	'backdone'、'running' -> 请求sse/generate-recover 进行断点续传
	'tasknotfound' -> 请求sse/generate 创建任务

*/
async function getSessionStatusAndDecide(prompt: string): Promise<SDF<string>> {
	/* 仅仅为了满足类型约束 */
	const forReturn = {
		code: '0',
		message: 'ok',
		data: ''
	};

	if (prompt) {
		/* 用户输入prompt后点击触发 */
		const sessionId = localStorage.getItem(llmSessionKey);
		if (sessionId) {
			const res = await instance.get<SDF<LLMSessionStatusResponse>>(
				`/session/status?sessionId=${sessionId}`
			);
			const status = res.data.data.status;

			if (status === 'notfound' || status === 'bothdone') {
				localStorage.setItem(sessionStatusKey, status);
				//新建会话
				const res = await instance.post<LLMSessionRequest, SDF<LLMSessionResponse>>(
					'session/context',
					{
						prompt
					}
				);
				localStorage.setItem(llmSessionKey, res.data.data.sessionId);
				localStorage.setItem(sessionStatusKey, 'tasknotfound');
			}

			if (status === 'backdone' || status === 'running' || status === 'tasknotfound') {
				message.warning('当前会话正在进行中，请稍后再试');
			}
		} else {
			//目前无会话,新建会话
			const res = await instance.post<LLMSessionRequest, SDF<LLMSessionResponse>>(
				'session/context',
				{
					prompt
				}
			);

			localStorage.setItem(llmSessionKey, res.data.data.sessionId);
			localStorage.setItem(sessionStatusKey, 'tasknotfound');
		}
		return forReturn;
	} else {
		/* 断点续传副作用触发 */
		const sessionId = localStorage.getItem(llmSessionKey);
		if (sessionId) {
			const res = await instance.get<SDF<LLMSessionStatusResponse>>(
				`/session/status?sessionId=${sessionId}`
			);
			const status = res.data.data.status;
			if (status === 'backdone' || status === 'running') {
				//断点续传
				localStorage.setItem(sessionStatusKey, status);
			}
			return forReturn;
		} else return forReturn;
	}
}
/* 
报告后端前端的SSE会话已完成
 */
async function frontendOver(sessionId: string) {
	//上报前端完成
	const res = await instance.get<SDF<string>>(`session/frontend-over?sessionId=${sessionId}`);
	return res;
}

/**
 * 通过EventSource请求特定接口获取SSE数据
 * @param setDone 设置完成状态的函数，标记SSE数据传输是否结束
 * @returns 清理函数，用于关闭EventSource连接
 */
function getSseData(
	setData: (data: string | ((prevData: string) => string)) => void,
	setDone: (done: boolean) => void,
	setError: (error: boolean) => void,
	setErrorCode: (code: string) => void,
	setErrorMsg: (msg: string) => void
): () => void {
	// 初始化状态
	setData('');
	setDone(false);
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
		}
	};

	// 验证用户登录状态
	const token = localStorage.getItem('token');
	if (!token) {
		setTupError('2006', '登录已过期，请重新登录');
		return cleanup;
	}

	// 验证会话是否存在
	const sessionId = localStorage.getItem(llmSessionKey);
	if (!sessionId) {
		return cleanup;
	}

	// 根据当前会话状态决策
	const status = localStorage.getItem(sessionStatusKey);

	// 如果会话已完成或不存在，不需要建立连接
	if (status === 'notfound' || status === 'bothdone') {
		return cleanup;
	}

	// 根据会话状态确定要请求的接口
	let url = '';
	const baseUrl = import.meta.env.VITE_API_BASE_URL;

	if (status === 'backdone' || status === 'running') {
		// 断点续传 - 从上次中断的地方继续
		url =
			baseUrl +
			'/sse/generate-recover' +
			`?sessionId=${localStorage.getItem(llmSessionKey)}&token=${token}`;
	} else if (status === 'tasknotfound') {
		// 创建新任务 - 开始新的生成
		url =
			baseUrl +
			'/sse/generate' +
			`?sessionId=${localStorage.getItem(llmSessionKey)}&token=${token}`;
	} else {
		// 状态不存在
		return cleanup;
	}

	try {
		// 创建EventSource连接，附加token进行身份验证
		eventSource = new EventSource(url);

		// 处理服务器推送的消息
		eventSource.onmessage = event => {
			const messageObj: DataChunk = JSON.parse(event.data as unknown as string);
			const chunk = messageObj.data;

			if (chunk.error) {
				cleanup();
				setTupError('9999', `chunk错误:${chunk.error}`);
			}

			// 数据流式抵达
			if (chunk.content) {
				setData((dataState: string) => dataState + chunk.content);
			}

			// 处理完成信号
			if (chunk.done) {
				// 上报后端：前端已完成接收
				frontendOver(sessionId).then(() => {
					localStorage.setItem(sessionStatusKey, 'bothdone');
				});

				setDone(true);
				cleanup();
			}
		};

		// 处理连接错误
		eventSource.onerror = event => {
			setDone(true);
			cleanup();
			setTupError('9999', `连接错误,请稍后重试`);
			console.error('SSE连接错误:', event);
		};
	} catch (error) {
		// 处理连接创建失败
		setTupError('9999', `连接服务器失败，请稍后重试`);
		console.error('创建EventSource失败:', error);
		cleanup();
	}

	return cleanup;
}

export { getSessionStatusAndDecide, getSseData };
