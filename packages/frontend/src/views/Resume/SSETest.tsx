import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { useCustomMutation } from '../../query';
import { getSessionStatusAndDecide, getSseData, sessionStatusKey } from '../../services/sse';
//TODO 弄一个获取当前聊天历史的query -> 后端完成SSE会话后储存到数据库, 当前端完成SSE会话后,主动更新其缓存
export function SSETest() {
	const [data, setData] = useState('');
	const [done, setDone] = useState(false);
	const [error, setError] = useState(false);
	const [errorCode, setErrorCode] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	function useCeateSessionPrompt() {
		return useCustomMutation<string, string>(getSessionStatusAndDecide, {
			onSuccess() {
				getSseData(setData, setDone, setError, setErrorCode, setErrorMsg);
			}
		});
	}

	const mutation = useCeateSessionPrompt();

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
			if (status === 'backdone' || status === 'running') {
				//进行断点续传
				getSseData(setData, setDone, setError, setErrorCode, setErrorMsg);
			}
		});
	}, []);

	return (
		<>
			<Button
				onClick={() => {
					//TODO 如果prompt为空,拒绝执行mutate
					mutation.mutate('test');
				}}
				className="bg-blue-500 text-white p-2 rounded"
			></Button>
			{data}
			{error ? `错误码:${errorCode} 错误信息:${errorMsg}` : null}
		</>
	);
}
