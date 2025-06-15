import type { MatchJobDto, ServerDataFormat as SDF } from '@prism-ai/shared';
import { instance } from './config';
interface PersistentTaskVo {
	id: string; // 任务唯一标识
	status: string; // 任务状态
}
/**
 * 启动一个后台任务，同步所有岗位数据到向量数据库
 * @returns 返回创建的后台任务
 */
export async function startSyncJobsToVectorDB() {
	const res = await instance.get<SDF<PersistentTaskVo>>('/hjm/sync-jobs');
	return res.data;
}

/**
 * 启动一个后台任务，为指定简历匹配岗位
 * @param matchJobsDto - 包含简历ID等信息的DTO
 * @returns 返回创建的后台任务
 */
export async function startMatchJobs(matchJobDto: MatchJobDto) {
	const res = await instance.post<MatchJobDto, SDF<PersistentTaskVo>>(
		'/hjm/match-jobs',
		matchJobDto
	);
	return res.data;
}
