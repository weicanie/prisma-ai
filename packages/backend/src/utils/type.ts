import { SelectedLLM, StreamingChunk, UserFeedback, UserInfoFromToken } from '@prism-ai/shared';
import { Types } from 'mongoose';
import { Observable } from 'rxjs';
/**
 * 用于获取populate后的Document类型
 * 即将相关字段的ObjectId、ObjectId[]类型转换为实际数据的类型
 *
 * T: 原始文档类型
 * K: 进行转换的字段名
 * R: 可选的映射类型，用于指定转换后的类型
 */
export type PopulateFields<T, K extends keyof T, R = unknown> = Omit<T, K> & {
	[P in K]: T[P] extends Types.ObjectId | Types.ObjectId[]
		? P extends keyof R
			? R[P]
			: unknown
		: T[P];
};

/**
 * LLM生成的chunk
 */
export interface LLMStreamingChunk extends StreamingChunk {}

/**
 * 返回sse数据的函数
 */
export type SseFunc = (
	input: any,
	userInfo: UserInfoFromToken,
	taskId: string,
	userFeedback: UserFeedback,
	model: SelectedLLM //使用的llm
) => Promise<Observable<LLMStreamingChunk>>;
