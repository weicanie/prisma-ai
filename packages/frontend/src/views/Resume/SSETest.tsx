import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { useCustomMutation } from '../../query';
import { ceateSession, llmSessionKey, useSseData } from '../../services/sse';

export function SSETest() {
	const [sessionId, setSessionId] = useState('');

	function useCeateSessionPrompt() {
		return useCustomMutation<string, string>(ceateSession, {
			onSuccess(data) {
				setSessionId(data.data);
			}
		});
	}
	const mutation = useCeateSessionPrompt();
	const { data, done, error, errorCode, errorMsg } = useSseData(sessionId);
	/* 用于断点续传 */
	useEffect(() => {
		//用户点击上传prompt前,什么都不做
		if (!localStorage.getItem(llmSessionKey)) return;
		ceateSession('');
	}, []);

	return (
		<>
			<Button
				onClick={() => {
					mutation.mutate('test');
				}}
				className="bg-blue-500 text-white p-2 rounded"
			></Button>
			{data}
			{error ? `错误码:${errorCode} 错误信息:${errorMsg}` : null}
		</>
	);
}
