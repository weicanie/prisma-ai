import { useEffect, useState } from 'react';
import { useCustomMutation } from '../query/config';
import { getSessionStatusAndDecide, getSseData, sessionStatusKey } from '../services/sse';
export function useSseAnswer(prompt: string) {
	const [data, setData] = useState('');
	const [done, setDone] = useState(false);
	const [error, setError] = useState(false);
	const [errorCode, setErrorCode] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	/* 控制同一时间只有一个对话,避免反复执行mutate */
	const [answering, setAnswering] = useState(false);

	function useCeateSessionPrompt() {
		return useCustomMutation<string, string>(getSessionStatusAndDecide, {
			onSuccess() {
				getSseData(setData, setDone, setError, setErrorCode, setErrorMsg);
			}
		});
	}

	const mutation = useCeateSessionPrompt();
	if (prompt && !answering) {
		mutation.mutate(prompt);
		setAnswering(true);
	}
	/* 
  用于页面刷新、重新打开后执行 ceateSession
  以支持断点续传 
  */
	useEffect(() => {
		/* 
    getSessionStatusAndDecide设计为传入''时
    只会查询并持久化当前持有的会话的状态
    不进行任何操作
    */
		getSessionStatusAndDecide('').then(() => {
			const status = localStorage.getItem(sessionStatusKey);
			//不影响正常的sse
			if (status === 'backdone' || status === 'running') {
				//进行断点续传
				getSseData(setData, setDone, setError, setErrorCode, setErrorMsg);
			}
		});
	}, []);
	return { data, done, error, errorCode, errorMsg };
}
