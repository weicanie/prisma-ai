import type {
	HjmMatchDto,
	JobVo,
	MatchedJobVo,
	PersistentTaskVo,
	ServerDataFormat as SDF,
	StartCrawlDto
} from '@prisma-ai/shared';
import { instance } from './config';

/**
 * 启动爬虫任务来抓取招聘信息
 * @param crawlData 启动爬虫所需的数据
 * @returns 返回创建的后台任务
 */
export async function startCrawl(crawlData: StartCrawlDto) {
	const res = await instance.post<StartCrawlDto, SDF<PersistentTaskVo>>('/job/crawl', crawlData);
	return res.data;
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
 * @param hjmMatchDto - 包含简历ID等信息的DTO
 * @returns 返回创建的后台任务
 */
export async function startMatchJobs(hjmMatchDto: HjmMatchDto) {
	const res = await instance.post<HjmMatchDto, SDF<PersistentTaskVo>>(
		'/hjm/match-jobs',
		hjmMatchDto
	);
	return res.data;
}

/**
 * 获取任务的状态和结果
 * @param taskId - 任务ID
 * @returns 返回任务信息和结果
 */
export async function getTaskResult(taskId: string) {
	const res = await instance.get<SDF<{ task: PersistentTaskVo; result?: MatchedJobVo[] }>>(
		`/hjm/${taskId}`
	);
	return res.data;
}

/**
 * 将爬虫抓取的岗位成为用户追踪的岗位
 * @param jobId 岗位id
 * @returns 岗位
 */
export async function becomeUserJob(jobId: string) {
	const res = await instance.get<SDF<JobVo>>(`/job/become/${jobId}`);
	return res.data;
}

/**
 * 返回数据库中的岗位数量
 * @returns 岗位数量
 */
export async function getJobCount() {
	const res = await instance.get<SDF<number>>('/hjm/job-count');
	return res.data;
}
