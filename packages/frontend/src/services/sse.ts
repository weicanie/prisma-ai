import type {
	DataChunk,
	LLMSessionRequest,
	LLMSessionResponse,
	LLMSessionStatusResponse,
	ServerDataFormat as SDF
} from '@prism-ai/shared';
import { useEffect, useRef, useState } from 'react';
import { instance } from './config';
export const llmSessionKey = 'llmSessionId'; //会话id储存的key
export const shouldRecoverKey = 'shouldRecover'; //是否应该请求断点续传

/* 建立新会话或者检查当前会话状态

当前ls无会话id,直接建立新会话

有会话id,检查当前会话状态再决策

*/
async function ceateSession(prompt: string): Promise<SDF<string>> {
	const sessionId = localStorage.getItem(llmSessionKey);
	if (sessionId) {
		const res = await instance.get<SDF<LLMSessionStatusResponse>>(
			`/session/status?sessionId=${sessionId}`
		);
		const status = res.data.data.status;
		console.log('🚀 ~ ceateSession ~ status:', status);

		if (status === 'backdone' || status === 'running') {
			//需要断点续传
			localStorage.setItem(shouldRecoverKey, 'yes');
		}

		if (status === 'notfound' || status === 'bothdone') {
			//新建会话
			const res = await instance.post<LLMSessionRequest, SDF<LLMSessionResponse>>(
				'session/context',
				{
					prompt
				}
			);
			localStorage.setItem(llmSessionKey, res.data.data.sessionId);
		}
	} else {
		//目前无会话,新建会话
		const res = await instance.post<LLMSessionRequest, SDF<LLMSessionResponse>>('session/context', {
			prompt
		});
		console.log('🚀 ~ ceateSession ~ res:', res);
		localStorage.setItem(llmSessionKey, res.data.data.sessionId);
	}
	return {
		code: '0',
		message: 'ok',
		data: localStorage.getItem(llmSessionKey) || ''
	};
}

async function frontendOver(sessionId: string) {
	//上报前端完成
	const res = await instance.get<SDF<string>>(`session/frontend-over?sessionId=${sessionId}`);
	return res;
}

//使用原生EventSource获取SSE数据
function useSseData(sessionId: string) {
	const [data, setData] = useState('');
	const [done, setDone] = useState(false);
	const [error, setError] = useState(false);
	const [errorCode, setErrorCode] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	const eventSourceRef = useRef<EventSource | null>(null);

	const setTupError = (code: string, msg: string) => {
		setError(true);
		setErrorCode(code);
		setErrorMsg(msg);
	};

	// 清理函数
	const cleanup = () => {
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
			eventSourceRef.current = null;
			// localStorage.removeItem(shouldRecoverKey);
		}
	};

	// 启动 SSE 连接
	useEffect(() => {
		setDone(false);

		//添加token
		const token = localStorage.getItem('token');
		if (!token) {
			setTupError('2006', '登录已过期，请重新登录');
		}
		//会话不存在则不请求
		const sessionId = localStorage.getItem(llmSessionKey);
		if (!sessionId) {
			return;
		}
		let url = '';
		const baseUrl = import.meta.env.VITE_API_BASE_URL;

		const shouldRecover = localStorage.getItem(shouldRecoverKey);
		if (shouldRecover === 'yes') {
			// 断点续传
			url = baseUrl + '/sse/generate-recover' + `?sessionId=${localStorage.getItem(llmSessionKey)}`;
		} else {
			url = baseUrl + '/sse/generate' + `?sessionId=${localStorage.getItem(llmSessionKey)}`;
		}
		console.log('🚀 ~ useEffect ~ url:', url);

		eventSourceRef.current = new EventSource(url + `&token=${token}`);

		eventSourceRef.current.onmessage = event => {
			const messageObj: DataChunk = JSON.parse(event.data as unknown as string);
			const chunk = messageObj.data;
			if (chunk.error) {
				cleanup();
				setTupError('9999', `chunk错误:${chunk.error}`);
			}
			//数据流式生成
			if (chunk.content) {
				setData((dataState: string) => dataState + chunk.content);
			}

			if (chunk.done) {
				//上报后端：SSE已完成
				//! 默认会进行断点重传
				frontendOver(sessionId);
				setDone(true);
				cleanup();
			}
		};

		eventSourceRef.current.onerror = event => {
			setDone(true);
			cleanup();
			setTupError('9999', `错误,请稍后重试`);
			console.error(event);
		};

		return cleanup;
	}, [sessionId]);

	//! SSE你用什么 React Query 啊? 本来就是临时的东西你缓存什么啊?
	return {
		data,
		done,
		error,
		errorCode,
		errorMsg
	};
}

export { ceateSession, useSseData };
