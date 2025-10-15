import { Document } from '@langchain/core/documents';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	initialUserConfig,
	JobStatus,
	JobVo,
	LLMJobDto,
	ResumeVo,
	UserConfig,
	UserInfoFromToken,
	userMemoryJsonToText
} from '@prisma-ai/shared';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Model } from 'mongoose';
import { ChainService } from '../../chain/chain.service';
import { RedisService } from '../../redis/redis.service';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { PersistentTask } from '../../type/taskqueue';
import { VectorStoreService } from '../../vector-store/vector-store.service';
import { Job, JobDocument } from '../job/entities/job.entity';
import { JobService } from '../job/job.service';
import { ResumeService } from '../resume/resume.service';
import { UserMemoryService } from '../user-memory/user-memory.service';
export interface RankedJob extends JobVo {
	reason?: string;
}

/**
 * @description 岗位向量化任务的元数据接口
 */
interface JobEmbeddingTaskMetadata {
	userInfo: UserInfoFromToken;
}

/**
 * @description 人岗匹配任务的元数据接口
 */
interface JobMatchTaskMetadata {
	resumeId: string;
	userInfo: UserInfoFromToken;
	topK: number;
	rerankTopN: number;
	sessionId: string;
}

/**
 * @description 带有特定元数据的岗位向量化任务类型
 */
interface JobEmbeddingTask extends PersistentTask {
	metadata: JobEmbeddingTaskMetadata;
}

/**
 * @description 带有特定元数据的人岗匹配任务类型
 */
interface JobMatchTask extends PersistentTask {
	metadata: JobMatchTaskMetadata;
}

enum JobIndex {
	JOBS = 'jobs' // 岗位索引
}

enum JobIndexNamespace {
	JOBS = 'job-crawled' // 岗位索引
}

@Injectable()
export class HjmService implements OnModuleInit {
	private readonly logger = new Logger(HjmService.name);
	// 定义任务类型常量
	readonly taskTypeJobEmbedding = 'job_embedding';
	readonly taskTypeJobMatch = 'job_match';

	private readonly vdbIndexs = [JobIndex.JOBS];

	userInfoSpider = {
		userId: 'system',
		username: '系统爬虫',
		userConfig: initialUserConfig
	};

	@InjectModel(Job.name)
	private jobModel: Model<JobDocument>;

	constructor(
		private readonly vectorStoreService: VectorStoreService,
		private readonly jobService: JobService,
		private readonly resumeService: ResumeService,
		private readonly chainService: ChainService,
		private readonly taskQueueService: TaskQueueService,
		private readonly redisService: RedisService, // 注入RedisService以保存任务结果
		private userMemoryService: UserMemoryService
	) {
		// 在构造函数中注册任务处理器
		try {
			this.taskQueueService.registerTaskHandler(
				this.taskTypeJobEmbedding,
				this._jobEmbeddingTaskHandler.bind(this)
			);
			this.taskQueueService.registerTaskHandler(
				this.taskTypeJobMatch,
				this._jobMatchTaskHandler.bind(this)
			);
		} catch (error) {
			this.logger.error(`人岗匹配任务处理器注册失败: ${error}`);
			throw error;
		}
		this.logger.log(
			`人岗匹配任务处理器已注册: ${this.taskTypeJobEmbedding}, ${this.taskTypeJobMatch}`
		);
	}

	/**
	 * 确保要用到的向量数据库索引存在, 不存在则创建
	 * 顺便检查向量数据库连接
	 */
	async onModuleInit() {
		try {
			this.logger.log('正在检查 Pinecone 连接...');
			for (const index of this.vdbIndexs) {
				//使用默认的apiKey（只在本地使用）
				if (!(await this.vectorStoreService.indexExists('', index))) {
					await this.vectorStoreService.createEmptyIndex(
						'',
						index,
						this.vectorStoreService.embeddingModelService.dimensions ?? 768
					);
				}
			}
			this.logger.log('Pinecone 连接验证成功');
		} catch (error) {
			const errorMsg = `
	Pinecone 连接失败。可能的原因:
	1. 网络连接问题 - 请检查网络连接
	2. API密钥错误 - 请检查 PINECONE_API_KEY 环境变量
	3. 需要VPN - Pinecone 在某些地区可能需要VPN访问
	
	错误详情: ${(error as Error).message}
				`.trim();
			this.logger.error(errorMsg);
			throw new Error(errorMsg);
		}
	}

	/**
	 * 启动一个后台任务，将数据库中所有状态为COMMITTED的岗位数据进行向量化。
	 * @param userInfo - 用户信息(同步的是属于该用户的岗位数据)
	 * @param sessionId - 会话ID
	 * @returns {Promise<PersistentTask>} - 创建的后台任务
	 */
	async startJobEmbeddingTask(
		userInfo: UserInfoFromToken,
		sessionId: string
	): Promise<PersistentTask> {
		const task = await this.taskQueueService.createAndEnqueueTask(
			sessionId,
			userInfo.userId,
			this.taskTypeJobEmbedding,
			{ userInfo } as JobEmbeddingTaskMetadata
		);
		this.logger.log(`已创建岗位向量化任务: ${task.id}`);
		return task;
	}

	/**
	 * 启动一个后台任务，为指定简历匹配最合适的岗位。
	 * @param resumeId - 简历ID(用于匹配的简历)
	 * @param userInfo - 用户信息 (匹配的是属于全体用户共享的岗位数据——储存在向量数据库中)
	 * @param sessionId - 会话ID
	 * @param topK - 召回阶段返回的岗位数量
	 * @param rerankTopN - 重排阶段返回的最终岗位数量
	 * @returns {Promise<PersistentTask>} - 创建的后台任务
	 */
	async startJobMatchTask(
		resumeId: string,
		userInfo: UserInfoFromToken,
		sessionId: string,
		topK: number = 20,
		rerankTopN: number = 5
	): Promise<PersistentTask> {
		const task = await this.taskQueueService.createAndEnqueueTask(
			sessionId,
			userInfo.userId,
			this.taskTypeJobMatch,
			{
				resumeId,
				userInfo,
				topK,
				rerankTopN,
				sessionId
			} as JobMatchTaskMetadata
		);
		this.logger.log(`已创建人岗匹配任务: ${task.id}`);
		return task;
	}

	/**
	 * 岗位向量化任务的处理器。
	 * @param task - 任务对象
	 * @description 使用SBERT模型将岗位描述分割成多个文本块 (chunks)，然后使用SBERT模型将所有文本块向量化并存储
	 * @private
	 */
	private async _jobEmbeddingTaskHandler(task: JobEmbeddingTask): Promise<void> {
		this.logger.log(`开始执行岗位向量化任务: ${task.id}`);
		const { userInfo } = task.metadata;

		// 1. 初始化文本分割器
		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 300, // 每个块的最大字符数
			chunkOverlap: 50 // 相邻块之间的重叠字符数
		});

		let done = false;
		let doneCount = 0;
		while (!done) {
			// 2. 从数据库获取未处理的岗位数据（爬取到的岗位数据、用户上传的岗位数据）
			const allJobsResultSpider = await this.jobService.findAll(
				this.userInfoSpider,
				1,
				100,
				JobStatus.COMMITTED
			);
			const allJobsResultUser = await this.jobService.findAll(
				userInfo,
				1,
				100,
				JobStatus.COMMITTED
			);
			const allJobs = [...allJobsResultSpider.data, ...allJobsResultUser.data];
			if (allJobs.length === 0) {
				done = true;
			} else {
				doneCount += allJobs.length;

				// 3. 将每个岗位描述分割成多个文本块 (chunks)
				const allChunks: Document[] = [];
				for (const job of allJobs) {
					const tempDoc = new Document({
						pageContent: `职位: ${job.jobName}, 公司: ${job.companyName}. 职位描述: ${job.description}`,
						metadata: {
							jobId: job.id,
							jobName: job.jobName,
							companyName: job.companyName
						}
					});
					const chunks = await textSplitter.splitDocuments([tempDoc]);
					allChunks.push(...chunks);
				}

				this.logger.log(`已将 ${allJobs.length} 个岗位分割成 ${allChunks.length} 个文本块。`);

				// 4. 使用SBERT模型将所有文本块向量化并存储
				const embeddings = this.vectorStoreService.getLocalEmbeddings();
				try {
					await this.vectorStoreService.addDocumentsToIndex(
						'',
						allChunks,
						JobIndex.JOBS,
						embeddings,
						this._getUserNamespace(JobIndexNamespace.JOBS, userInfo)
					);
				} catch (error) {
					console.error('使用SBERT模型进行向量化失败', error);
					throw error;
				}
				/* 5. 更新刚刚处理的岗位数据的状态为EMBEDDED */

				const allJobUpdate = allJobs.map(job =>
					this.jobService.update(
						job.id,
						{ status: JobStatus.EMBEDDED },
						job.userInfo.userId === this.userInfoSpider.userId ? this.userInfoSpider : userInfo
					)
				);
				const promiseAll = Promise.allSettled(allJobUpdate);
				const result = await promiseAll;
				const failed = result.filter(r => r.status === 'rejected');
				if (failed.length > 0) {
					this.logger.error(
						`岗位向量化任务 ${task.id} 更新岗位数据状态失败,失败数量: ${failed.length}`
					);
				}
			}
		}

		this.logger.log(`岗位向量化任务 ${task.id} 完成, 共处理 ${doneCount} 个岗位。`);
	}

	/**
	 * 人岗匹配任务的处理器。
	 * @param task - 任务对象
	 * @description 使用平均向量进行多向量 -> 多向量检索
	 * @private
	 */
	private async _jobMatchTaskHandler(task: JobMatchTask): Promise<void> {
		this.logger.log(`开始执行人岗匹配任务: ${task.id}`);
		const { resumeId, userInfo, topK, rerankTopN } = task.metadata;

		// 1. 获取简历信息并格式化为长文本
		const resume = await this.resumeService.findOne(resumeId, userInfo);
		const resumeText = await this.formatResumeToText(resume, userInfo.userConfig!);

		// 2. 将简历文本也进行分块
		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 300,
			chunkOverlap: 50
		});

		const resumeChunks = await textSplitter.splitText(resumeText);
		this.logger.log(`已将简历分割成 ${resumeChunks.length} 个文本块。`);

		let resumeVector: number[];
		try {
			// 3. 为简历的每个块生成向量
			const resumeChunkVectors = await this.vectorStoreService
				.getLocalEmbeddings()
				.embedDocuments(resumeChunks);

			// 4. 计算所有简历块向量的平均值，得到一个最终的代表性向量
			if (resumeChunkVectors.length > 0) {
				const dimension = resumeChunkVectors[0].length;
				const sumVector = new Array(dimension).fill(0);
				for (const vec of resumeChunkVectors) {
					for (let i = 0; i < dimension; i++) {
						sumVector[i] += vec[i];
					}
				}
				resumeVector = sumVector.map(v => v / resumeChunkVectors.length);
				this.logger.log(`已生成平均后的简历向量，维度: ${resumeVector.length}`);
			} else {
				this.logger.error(`简历 ${resumeId} 未能生成任何文本块。`);
				return;
			}
		} catch (error) {
			throw new Error(`简历向量化失败: ${(error as Error).message}`);
		}

		// 5. 使用平均后的单一向量，在向量数据库中查找最相似的 topK 个岗位块
		const candidateJobChunks = await this.findSimilarJobs(userInfo, resumeVector, topK);
		this.logger.log(`向量数据库查询返回 ${candidateJobChunks.length} 个候选岗位块`);

		if (candidateJobChunks.length === 0) {
			this.logger.warn(
				`用户 ${userInfo.userId} 的简历 ${resumeId} 未找到任何匹配的岗位。可能原因：1. 该用户尚未进行岗位向量化 2. 向量数据库中没有相关数据 3. 网络连接问题`
			);
			return;
		}

		// 6. 从返回的岗位块中提取岗位ID (去重)
		const uniqueJobIds = [
			...new Set(candidateJobChunks.map(chunk => chunk.metadata.jobId as string))
		];

		this.logger.log(
			`召回 ${candidateJobChunks.length} 个岗位块, 去重后得到 ${uniqueJobIds.length} 个唯一岗位。`
		);

		// 7. 获取这些候选岗位的完整信息
		const candidateJobs = (
			await Promise.all(
				uniqueJobIds.map(id => this.jobService.findOne(id, userInfo).catch(() => null))
			)
		).filter(job => job !== null) as JobVo[];

		// 8. 调用 LLM 进行重排 (Rerank)
		const userMemory = await this.userMemoryService.getUserMemory(userInfo.userId);
		const userMemoryText = userMemory ? userMemoryJsonToText(userMemory) : '';
		const rerankChain = await this.chainService.hjmRerankChain(userInfo.userConfig!);
		const rerankResult = await rerankChain.invoke({
			userMemory: userMemoryText,
			jobs: candidateJobs
		});

		// 9. 整合最终结果
		const rankedJobsWithReason = rerankResult.ranked_jobs.slice(0, rerankTopN);

		const finalJobs = rankedJobsWithReason.map(rankedJob => {
			const jobDetails = candidateJobs.find(j => j.id === rankedJob.job_id);
			return {
				...jobDetails,
				reason: rankedJob.reason
			};
		}) as RankedJob[];

		// 10. 将结果存入数据库
		finalJobs.forEach(job => {
			const recallItem = {
				resumeId,
				reason: job.reason
			};
			this.jobModel.updateOne({ _id: job.id }, { $push: { recall: recallItem } });
		});

		// 11. 将结果存入Redis
		const resultKey = `${this.taskQueueService.PREFIX.RESULT}${task.id}`;
		await this.redisService.set(
			resultKey,
			JSON.stringify(finalJobs),
			this.taskQueueService.TASK_TTL
		);

		// 12. 更新任务，记录结果存储的key
		const currentTask = await this.taskQueueService.getTask<JobMatchTask>(task.id);
		if (currentTask) {
			currentTask.resultKey = resultKey;
			await this.taskQueueService.saveTask(currentTask);
		}

		this.logger.log(`人岗匹配任务 ${task.id} 完成。结果已存入 Redis: ${resultKey}`);
	}

	/**
	 * 将简历对象通过llm转化为一段长文本,用于召回
	 * @param resume - 简历VO对象
	 * @description 用llm把简历改写成反映用户画像的岗位描述！
	 * @returns {string} - 用于召回的文本
	 */
	private async formatResumeToText(resume: ResumeVo, userConfig: UserConfig): Promise<string> {
		const toTextChain = await this.chainService.hjmTransformChain(false, userConfig);
		const result: LLMJobDto = await toTextChain.invoke(JSON.stringify(resume));
		const text = `职位: ${result.jobName}, 公司: ${result.companyName}. 职位要求: ${result.description}`;
		return text;
	}

	/**
	 * 根据简历向量在岗位索引中查找相似的岗位
	 * @param userInfo - 用户信息
	 * @param resumeVector - 简历文本生成的向量
	 * @param k - 返回最相似的岗位数量
	 * @returns 返回一个包含岗位信息的文档数组
	 */
	async findSimilarJobs(
		userInfo: UserInfoFromToken,
		resumeVector: number[],
		k: number
	): Promise<Document[]> {
		try {
			const indexName = JobIndex.JOBS;
			const index = this.vectorStoreService.pinecone.Index(indexName);
			const namespace = this._getUserNamespace(JobIndexNamespace.JOBS, userInfo);

			this.logger.log(
				`开始向量查询 - 索引: ${indexName}, 命名空间: ${namespace}, topK: ${k}, 向量维度: ${resumeVector.length}`
			);

			const queryResult = await index.namespace(namespace).query({
				vector: resumeVector,
				topK: k,
				includeMetadata: true // 确保返回元数据，其中包含岗位信息
			});

			this.logger.log(`Pinecone 查询完成 - 返回匹配数: ${queryResult.matches?.length || 0}`);

			// 将查询结果转换为 LangChain 的 Document 格式
			const documents =
				queryResult.matches?.map(
					match =>
						new Document({
							pageContent: match.metadata?.pageContent as string,
							metadata: match.metadata || {}
						})
				) || [];

			this.logger.log(`转换为 Document 格式完成 - 文档数: ${documents.length}`);
			return documents;
		} catch (error) {
			const errorMessage = (error as Error).message;
			console.error('查找相似岗位失败:', error);

			if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
				throw new Error(
					`网络连接失败: 无法连接到 Pinecone 服务器进行查询。请检查网络连接或VPN设置。`
				);
			} else if (errorMessage.includes('timeout')) {
				throw new Error(`查询超时: 网络连接不稳定，请重试或检查VPN连接。`);
			}

			throw new Error(`查询向量数据库失败: ${errorMessage}`);
		}
	}

	private _getUserNamespace(namespace: JobIndexNamespace, userInfo: UserInfoFromToken): string {
		switch (namespace) {
			case JobIndexNamespace.JOBS:
				return `${namespace}-${userInfo.userId}`;
			default:
				throw new Error(`不支持的命名空间: ${namespace}`);
		}
	}

	/**
	 * 返回数据库中的岗位数量
	 */
	async getJobCount(): Promise<number> {
		return await this.jobModel.countDocuments();
	}
}
