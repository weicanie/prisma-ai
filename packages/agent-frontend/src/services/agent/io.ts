import type {
	ImplementDto,
	InterruptType,
	PersistentTaskVo,
	RecoverDto,
	ServerDataFormat,
	StageResult
} from '@prisma-ai/shared';
import { instance } from '../config';

/**
 * 启动 Agent
 * @param dto ImplementDto
 * @returns 启动结果（可能是runId或其他信息，根据后端实现调整）
 */
export async function startAgent(dto: ImplementDto) {
	const res = await instance.post<
		ImplementDto,
		ServerDataFormat<PersistentTaskVo & { runId: string }>
	>('/prisma_agent/start', dto);
	return res.data;
}

/**
 * 获取 Agent 阶段性结果 (长轮询)
 * @param runId 运行ID
 * @returns StageResult
 */
export async function getStageResult(runId: string) {
	const res = await instance.get<ServerDataFormat<StageResult>>('/prisma_agent/stage_result', {
		params: { runId },
		timeout: 65000 // 设置稍大于后端 60s 的超时时间
	});
	return res.data;
}

/**
 * 获取 Agent 是否有正在生成的流 (长轮询)
 * @param runId 运行ID
 */
export async function hasCurStream(runId: string) {
	const res = await instance.get<
		ServerDataFormat<{ hasCurStream: boolean; pollDone: boolean; interruptType: InterruptType }>
	>('/prisma_agent/has_cur_stream', {
		params: { runId },
		timeout: 65000 // 设置稍大于后端 60s 的超时时间
	});
	return res.data;
}

/**
 * 报告后端当前流已结束
 * @param runId 运行ID
 * @returns void
 */
export async function deleteCurStream(runId: string) {
	const res = await instance.post<void, ServerDataFormat<void>>(
		'/prisma_agent/done_cur_stream',
		void 0,
		{
			params: { runId }
		}
	);
	return res.data;
}

/**
 * 恢复 Agent 执行 (用户反馈)
 * @param dto RecoverDto
 * @returns void
 */
export async function recoverAgent(dto: RecoverDto) {
	const res = await instance.post<RecoverDto, ServerDataFormat<void>>(
		'/prisma_agent/stage_recover',
		dto
	);
	return res.data;
}

/**
 * 用户手动中断 Agent
 * @param runId 运行ID
 * @returns void
 */
export async function interruptAgent(runId: string) {
	const res = await instance.post<void, ServerDataFormat<void>>(
		'/prisma_agent/user_interrupt',
		void 0,
		{
			params: { runId }
		}
	);
	return res.data;
}

/**
 * 用户手动恢复 Agent (从手动中断中恢复)
 * @param runId 运行ID
 * @returns void
 */
export async function userRecoverAgent(runId: string) {
	const res = await instance.post<void, ServerDataFormat<void>>(
		'/prisma_agent/user_recover',
		void 0,
		{
			params: { runId }
		}
	);
	return res.data;
}
