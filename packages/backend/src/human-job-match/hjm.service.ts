import { Document } from '@langchain/core/documents';
import { Injectable } from '@nestjs/common';
import { JobStatus, JobVo, LLMJobDto, ResumeVo, UserInfoFromToken } from '@prism-ai/shared';
import { JobService } from '../business/job/job.service';
import { ResumeService } from '../business/resume/resume.service';
import { ChainService } from '../chain/chain.service';
import { PineconeIndex, VectorStoreService } from '../vector-store/vector-store.service';

export interface RankedJob extends JobVo {
	reason: string;
}

@Injectable()
export class HjmService {
	constructor(
		private readonly vectorStoreService: VectorStoreService,
		private readonly jobService: JobService,
		private readonly resumeService: ResumeService,
		private readonly chainService: ChainService
	) {}

	/**
	 * 将数据库中的所有未embedding的岗位数据向量化并存入向量数据库
	 * @param userInfo - 用户信息
	 * @returns {Promise<{ message: string, count: number }>} - 操作结果
	 */
	async syncJobsToVectorDB(
		userInfo: UserInfoFromToken
	): Promise<{ message: string; count: number }> {
		let done = false;
		let doneCount = 0;
		while (!done) {
			// 1. 从数据库获取未处理的岗位数据
			const allJobsResult = await this.jobService.findAll(userInfo, 1, 1000, JobStatus.COMMITTED); //已追踪当然就没必要考虑有没有嵌入
			const allJobs = allJobsResult.data;
			if (allJobs.length === 0) {
				done = true;
			} else {
				doneCount += allJobs.length;
				// 2. 将岗位数据转换为 Document 格式
				const documents = allJobs.map(
					job =>
						new Document({
							pageContent: `职位: ${job.jobName}, 公司: ${job.companyName}. 职位要求: ${job.description}`,
							metadata: {
								jobId: job.id,
								jobName: job.jobName,
								companyName: job.companyName
							}
						})
				);

				// 3. 使用SEBRT模型进行向量化并存储
				const embeddings = this.vectorStoreService.getLocalEmbeddings();
				try {
					await this.vectorStoreService.addDocumentsToIndex(
						documents,
						PineconeIndex.JOBS,
						embeddings
					);
				} catch (error) {
					console.error('使用SEBRT模型进行向量化失败', error);
					throw error;
				}
				/* 4. 更新刚刚处理的岗位数据的状态为EMBEDDED */
				const allJobUpdate = allJobs.map(job =>
					this.jobService.update(job.id, { status: JobStatus.EMBEDDED }, userInfo)
				);
				const promiseAll = Promise.allSettled(allJobUpdate);
				await promiseAll;
			}
		}

		if (doneCount === 0) {
			return { message: '没有需要同步的岗位数据', count: 0 };
		}

		return { message: '岗位数据同步成功', count: doneCount };
	}

	/**
	 * 为指定简历匹配最合适的岗位
	 * @param resumeId - 简历ID
	 * @param userInfo - 用户信息
	 * @param topK - 召回阶段返回的岗位数量
	 * @param rerankTopN - 重排阶段返回的最终岗位数量
	 * @returns {Promise<RankedJob[]>} - 排序并附带匹配原因的岗位列表
	 */
	async matchJobsForResume(
		resumeId: string,
		userInfo: UserInfoFromToken,
		topK: number = 20,
		rerankTopN: number = 5
	): Promise<RankedJob[]> {
		// 1. 获取简历信息
		const resume = await this.resumeService.findOne(resumeId, userInfo);

		// 2. 将简历内容转换为文本并生成向量 (召回)
		const resumeText = await this.formatResumeToText(resume);
		let resumeVector: number[];
		try {
			resumeVector = await this.vectorStoreService.getLocalEmbeddings().embedQuery(resumeText);
		} catch (error) {
			const errorMessage = (error as Error).message;
			if (errorMessage.includes('网络连接失败') || errorMessage.includes('连接超时')) {
				throw new Error(`简历向量化失败: ${errorMessage}`);
			}
			throw new Error(`简历向量化失败: ${errorMessage}`);
		}

		// 3. 在向量数据库中查找最相似的 topK 个岗位
		const candidateJobDocs = await this.vectorStoreService.findSimilarJobs(resumeVector, topK);
		if (candidateJobDocs.length === 0) {
			return [];
		}

		// 4. 获取这些候选岗位的完整信息
		const candidateJobIds = candidateJobDocs.map(doc => doc.metadata.jobId);
		const candidateJobs = (
			await Promise.all(
				candidateJobIds.map(id => this.jobService.findOne(id, userInfo).catch(() => null))
			)
		).filter(job => job !== null) as JobVo[];

		// 5. 调用 LLM 进行重排 (Rerank)
		const rerankChain = await this.chainService.hjmRerankChain();
		const rerankResult = await rerankChain.invoke({
			resume,
			jobs: candidateJobs
		});

		// 6. 整合最终结果
		const rankedJobsWithReason = rerankResult.ranked_jobs.slice(0, rerankTopN);

		const finalJobs = rankedJobsWithReason.map(rankedJob => {
			const jobDetails = candidateJobs.find(j => j.id === rankedJob.job_id);
			return {
				...jobDetails,
				reason: rankedJob.reason
			};
		}) as RankedJob[];

		return finalJobs;
	}

	/**
	 * 将简历对象格式化为一段长文本
	 * @param resume - 简历VO对象
	 * @returns {string} - 用于向量化的文本
	 */
	private async formatResumeToText(resume: ResumeVo): Promise<string> {
		const toTextChain = await this.chainService.hjmTransformChain();
		const result: LLMJobDto = await toTextChain.invoke(JSON.stringify(resume));
		const text = `职位: ${result.jobName}, 公司: ${result.companyName}. 职位要求: ${result.description}`;
		return text;
	}
}
