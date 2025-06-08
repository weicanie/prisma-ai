import { useEffect, useState } from 'react';
import { useCustomMutation } from '../../query/config';
import {
	getSessionStatusAndDecide,
	getSseData,
	pathKey,
	sessionStatusKey,
	type contextInput
} from './sse';

/**
 * 传入的的input非{}时创建sse会话并开启sse响应
 * @param input 后端方法的输入
 * @param path 请求的URL路径,如 '/project/lookup'
 * @returns
 */
export function useSseAnswer(input: contextInput | object, path: string) {
	const doNotStart = typeof input === 'object' && Object.getOwnPropertyNames(input).length === 0;
	const [content, setContent] = useState('');
	const [reasonContent, setReasonContent] = useState('');
	const [done, setDone] = useState(false);
	const [isReasoning, setIsReasoning] = useState(false);

	const [error, setError] = useState(false);
	const [errorCode, setErrorCode] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	/* 控制同一时间只有一个对话,避免反复执行mutate */
	const [answering, setAnswering] = useState(false);
	console.log('🚀 ~ useSseAnswer ~ answering:', answering);

	/* 上传prompt建立会话, 开始接收llm流式返回 */
	function useCeateSession() {
		return useCustomMutation<string, contextInput>(getSessionStatusAndDecide, {
			onSuccess() {
				getSseData(
					path,
					setContent,
					setReasonContent,
					setDone,
					setIsReasoning,
					setError,
					setErrorCode,
					setErrorMsg,
					setAnswering
				);
			}
		});
	}

	const mutation = useCeateSession();
	if (!doNotStart && !answering) {
		mutation.mutate(input as contextInput);
		setAnswering(true);
	}
	/* 
  用于页面刷新、重新打开后执行 getSessionStatusAndDecide
  以支持断点接传 
  */
	useEffect(() => {
		/* 
    getSessionStatusAndDecide设计为input传入''时
    只会查询并持久化当前持有的会话的状态
    不进行任何操作
    */
		const getSessionStatusOnly = getSessionStatusAndDecide;
		getSessionStatusOnly('').then(() => {
			const status = localStorage.getItem(sessionStatusKey);
			//不影响正常的sse
			if (status === 'backdone' || status === 'running') {
				const curPath = localStorage.getItem(pathKey);
				if (curPath === null) console.error('path不存在,断点接传失败');

				//进行断点接传
				getSseData(
					curPath!,
					setContent,
					setReasonContent,
					setDone,
					setIsReasoning,
					setError,
					setErrorCode,
					setErrorMsg,
					setAnswering
				);
			}
		});
	}, []);
	return { content, reasonContent, done, isReasoning, error, errorCode, errorMsg };
}
