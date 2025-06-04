import { Button } from 'antd';
import { useState } from 'react';
import { useSseAnswer } from '../../../services/sse/useSseAnswer';
//TODO 弄一个获取当前聊天历史的query -> 后端完成SSE会话后储存到数据库, 当前端完成SSE会话后,主动更新其缓存
export function SSEHook() {
	const [prompt, setPrompt] = useState('');
	const { data, done, error, errorCode, errorMsg } = useSseAnswer('', 'mine');

	return (
		<>
			<Button
				onClick={() => {
					setPrompt('test');
				}}
				className="bg-blue-500 text-white p-2 rounded"
			></Button>
			{data}
			{error ? `错误码:${errorCode} 错误信息:${errorMsg}` : null}
		</>
	);
}
