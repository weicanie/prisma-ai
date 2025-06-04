import { RequestTargetMap, type TRequestParams } from '@prism-ai/shared';
import { useEffect, useState } from 'react';
import { useCustomMutation } from '../../query/config';
import { getSessionStatusAndDecide, getSseData, sessionStatusKey } from './sse';

/**
 * 传入的的input非{}时创建sse会话并开启sse响应
 * @param input 后端方法的输入
 * @param target 后端方法键名
 * @returns
 */
export function useSseAnswer(
	input: TRequestParams[typeof target]['input'] | {},
	target: keyof typeof RequestTargetMap
) {
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

	/* 上传prompt建立会话, 开始接收llm流式返回 */
	function useCeateSessionPrompt() {
		return useCustomMutation<string, { input: any; target: keyof typeof RequestTargetMap }>(
			getSessionStatusAndDecide,
			{
				onSuccess() {
					getSseData(
						RequestTargetMap[target],
						setContent,
						setReasonContent,
						setDone,
						setIsReasoning,
						setError,
						setErrorCode,
						setErrorMsg
					);
				}
			}
		);
	}

	const mutation = useCeateSessionPrompt();
	if (!doNotStart && !answering) {
		mutation.mutate({ input, target });
		setAnswering(true);
	}
	/* 
  用于页面刷新、重新打开后执行 getSessionStatusAndDecide
  以支持断点续传 
  */
	useEffect(() => {
		/* 
    getSessionStatusAndDecide设计为input传入''时
    只会查询并持久化当前持有的会话的状态
    不进行任何操作
    */
		const getSessionStatusOnly = getSessionStatusAndDecide;
		getSessionStatusOnly({ input: '', target: 'mine' }).then(() => {
			const status = localStorage.getItem(sessionStatusKey);
			//不影响正常的sse
			if (status === 'backdone' || status === 'running') {
				//进行断点续传
				getSseData(
					RequestTargetMap[target],
					setContent,
					setReasonContent,
					setDone,
					setIsReasoning,
					setError,
					setErrorCode,
					setErrorMsg
				);
			}
		});
	}, []);
	return { content, reasonContent, done, isReasoning, error, errorCode, errorMsg };
}
