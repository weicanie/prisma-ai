import { UserInfoFromToken } from '../login_regist/';

/* chunk的标准格式,其它observable返回的chunk都需要转换为该格式
  用于流式数据的sse传输和存储
*/
export interface StreamingChunk {
	content: string; // 内容
	reasonContent?: string; // 推理内容-r1
	done: boolean; // 是否完成
	isReasoning?: boolean; // 是否是推理中-r1
}

/* 前端收到的chunk数据格式 */
export interface DataChunkVO {
	data: StreamingChunk & {
		cached?: boolean; //是否命中llm缓存
		exact?: boolean; //缓存命中类型 true: 相同 false:相似
	};
}
/* 前端收到的chunk数据格式-错误信息 */
export interface DataChunkErrVO {
	data: {
		error: string;
		done: true;
	};
}

/**
 * @description 用户反馈，用于决定是否需要进行反思
 */
export interface UserFeedback {
	reflect: boolean;
	content: string; // 当 reflect 为 true 时，这里是用户的反馈内容
}

//用于创建llm-sse会话的context
export interface LLMSessionRequest {
	input: any; //传入目标方法的输入
	userFeedback?: UserFeedback; //用户反馈,决定是否反思,默认不反思,此时字段应该为空
	userInfo?: UserInfoFromToken; //由登录验证 Guard 注入的用户信息
}
//llm-sse会话创建成功后的响应
export interface LLMSessionResponse {
	sessionId: string;
}
//llm-sse会话状态
export interface LLMSessionStatusResponse {
	/*
    服务端完成但客户端没完成、会话缓存没了（视为会话不存在）：'notfound' 前端应该新建会话
    服务端和客户端都完成：'bothdone' 前端应该新建会话
      
    服务端完成但客户端没完成、会话缓存还在：'backdone' 前端应该请求断点续传

    服务端和客户端都没完成、创建了任务：'running' 前端应该请求断点续传
    服务端和客户端都没完成、没创建任务：'tasknotfound' 前端应该请求sse/generate接口创建任务

   */
	status: 'notfound' | 'bothdone' | 'backdone' | 'running' | 'tasknotfound';
}
