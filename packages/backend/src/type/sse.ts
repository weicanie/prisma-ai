export interface DeepSeekStreamChunk {
	id: string;
	content: string | ''; //生成内容
	additional_kwargs: {
		reasoning_content?: string | null; //推理内容
	};
	tool_calls: [];
	tool_call_chunks: [];
	invalid_tool_calls: [];
}
