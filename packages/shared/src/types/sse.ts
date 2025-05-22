interface DataChunk {
	data: {
		content?: string;
		error?: string;
		done: boolean;
		cached?: boolean; //是否命中缓存
		exact?: boolean; //缓存命中类型 true: 相同 false:相似
	};
}
//创建会话
interface LLMSessionRequest {
	prompt: string;
}
interface LLMSessionResponse {
	sessionId: string;
}
//查询会话状态
interface LLMSessionStatusResponse {
	status: 'notfound' | 'bothdone' | 'backdone' | 'running' | 'tasknotfound';
}
export { DataChunk, LLMSessionRequest, LLMSessionResponse, LLMSessionStatusResponse };
