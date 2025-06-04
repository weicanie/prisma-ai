import { UserInfoFromToken } from './loginVerify';
import { ProjectDto } from './project';

/* chunk的标准格式,其它observable返回的chunk都需要转换为该格式
 	用于流式数据的sse传输和存储
*/
export interface StreamingChunk {
	content: string; // 内容
	reasonContent?: string; // 推理内容-r1
	done: boolean; // 是否完成
	isReasoning?: boolean; // 是否是推理中-r1
}

/* 前端收到的数据格式 */
export interface DataChunk {
	data: StreamingChunk & {
		error?: string; // 错误信息
		cached?: boolean; //是否命中llm缓存
		exact?: boolean; //缓存命中类型 true: 相同 false:相似
	};
}

/* 参数类型 */
export interface TRequestParams {
	polish: {
		input: ProjectDto;
		target: 'polish';
	};
	mine: {
		input: ProjectDto;
		target: 'mine';
	};
}

export const RequestTargetMap = {
	polish: '/sse/project-generate', //类型占位符
	mine: '/sse/project-generate'
};
//用于创建sse会话的context类型
export interface LLMSessionRequest {
	input: any; //传入目标方法的输入
	target: keyof typeof RequestTargetMap; //目标方法
	userInfo?: UserInfoFromToken; //由登录验证 Guard 注入的用户信息
}
export interface LLMSessionResponse {
	sessionId: string;
}
//查询会话状态
export interface LLMSessionStatusResponse {
	status: 'notfound' | 'bothdone' | 'backdone' | 'running' | 'tasknotfound';
}
