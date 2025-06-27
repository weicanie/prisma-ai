import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { UserInfoFromToken } from '@prism-ai/shared';
import { createWorker } from 'tesseract.js';
import { ChainService } from '../../chain/chain.service';
import { OssService } from '../../oss/oss.service';
import { RedisService } from '../../redis/redis.service';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { HjmService } from '../human-job-match/hjm.service';
import { JobService } from '../job/job.service';
import { ProjectProcessService } from '../project/project-process.service';
import { ProjectService } from '../project/project.service';
import { ResumeService } from '../resume/resume.service';
import { SkillService } from '../skill/skill.service';
//TODO 学习路线CRUD
//* 简历版本控制,数组 {版本号, changelog},仿git即可
@Injectable()
export class AutoflowService {
	private readonly logger = new Logger(AutoflowService.name);

	constructor(
		@Inject(forwardRef(() => ProjectService))
		private readonly projectService: ProjectService,
		@Inject(forwardRef(() => JobService))
		private readonly jobService: JobService,
		@Inject(forwardRef(() => SkillService))
		private readonly skillService: SkillService,
		@Inject(forwardRef(() => ResumeService))
		private readonly resumeService: ResumeService,
		@Inject(forwardRef(() => HjmService))
		private readonly hjmService: HjmService,
		private readonly ossService: OssService,
		private readonly chainService: ChainService,
		private readonly taskQueueService: TaskQueueService,
		private readonly redisService: RedisService,
		private readonly projectProcessService: ProjectProcessService
	) {}

	/**
	 * 从图片中提取文本
	 * @param image 图片的Buffer或者url
	 * @returns 提取出的文本
	 */
	async extractTextFromImage(image: Buffer | string): Promise<string> {
		//建议为每个识别任务创建一个新的工作者
		const worker = await createWorker('chi_sim+eng');

		try {
			const {
				data: { text }
			} = await worker.recognize(image);
			return text;
		} catch (error) {
			console.error('Error during OCR process:', error);
			throw new Error('Failed to extract text from image.');
		} finally {
			await worker.terminate();
		}
	}

	/**
	 * 运行自动化简历处理流程
	 * @param image 简历图片的Buffer
	 * @param userInfo 用户信息
	 * @returns 返回包含所有处理结果和最终报告URL的对象
	 */
	async run(image: Buffer, userInfo: UserInfoFromToken) {
		// this.logger.log(`[Autoflow] 流程开始，用户: ${userInfo.username}`);
		// const results = {
		// 	skillId: '',
		// 	projectIds: [] as string[],
		// 	originalResumeId: '',
		// 	finalResumeId: '',
		// 	reportUrl: ''
		// };
		//* 1. 简历图片 -> 简历文本
		// const resumeText = await this.extractTextFromImage(image);
		// this.logger.log(`[Autoflow] 步骤 1/4 完成: 从图片中提取文本成功。`);
		//* 2. 简历文本 -> 技术栈、项目经验json
		// const textToJsonChain = await this.chainService.textToJsonChain();
		// const extractedData = await textToJsonChain.invoke({ input: resumeText });
		// this.logger.log(`[Autoflow] 步骤 2/4 完成: 简历文本到JSON转换成功。`);
		//* 3. 保存初始数据到数据库并收集ID
		// 保存技能信息
		// const createdSkill = await this.skillService.create(
		// 	{
		// 		name: `来自简历的技能组合-${Date.now()}`,
		// 		...extractedData.skill
		// 	},
		// 	userInfo
		// );
		// results.skillId = createdSkill.id;
		// this.logger.log(`[Autoflow] 子步骤: 技能信息已保存, ID: ${results.skillId}`);
		// 保存项目经验
		// for (const projectDto of extractedData.projects) {
		// 	// 注意：checkoutProject会检查重名，对于自动化流程可能需要调整
		// 	// 为避免重名问题，这里为项目名称添加一个时间戳后缀
		// 	projectDto.info.name = `${projectDto.info.name}-${Date.now()}`;
		// 	const createdProject = await this.projectProcessService.checkoutProject(projectDto, userInfo);
		// 	results.projectIds.push(createdProject.id);
		// }
		// this.logger.log(`[Autoflow] 子步骤: ${results.projectIds.length}个项目经验已保存。`);
		//* 4. 创建简历并关联技能和项目
		// const resumeDto = {
		// 	name: `自动分析简历-${Date.now()}`,
		// 	skill: results.skillId,
		// 	projects: results.projectIds
		// };
		// const createdResume = await this.resumeService.create(resumeDto, userInfo);
		// results.originalResumeId = (createdResume as any)._id.toString();
		// this.logger.log(`[Autoflow] 步骤 3/4 完成: 简历创建成功, ID: ${results.originalResumeId}`);
		//* 5. 对每个项目进行深入分析 (lookup, polish, mine)
		// for (const projectId of results.projectIds) {
		// 	const project = await this.projectService.findProjectById(projectId, userInfo);
		// 	// Lookup
		// 	const lookupChain = await this.chainService.lookupChain();
		// 	const [lookupResult] = await lookupChain.invoke(JSON.stringify(project));
		// 	await this.projectService.updateLookupResult(projectId, lookupResult, userInfo);
		// 	this.logger.log(`[Autoflow] 子步骤: 项目 ${projectId} lookup分析完成。`);
		// 	const projectWithLookup = await this.projectService.findProjectById(projectId, userInfo);
		// 	// Polish
		// 	const polishChain = await this.chainService.polishChain();
		// 	const [polishedResult] = await polishChain.invoke(JSON.stringify(projectWithLookup));
		// 	// 注意: polishChain的结果没有做存储, 只更新项目本身
		// 	await this.projectService.updateProject(
		// 		projectId,
		// 		{
		// 			info: polishedResult.info,
		// 			lightspot: polishedResult.lightspot
		// 		},
		// 		userInfo
		// 	);
		// 	this.logger.log(`[Autoflow] 子步骤: 项目 ${projectId} polish分析完成。`);
		// 	// Mine
		// 	const mineChain = await this.chainService.mineChain();
		// 	const [minedResult] = await mineChain.invoke(JSON.stringify(project));
		// 	// 注意: mineChain的结果没有做存储, 只更新项目本身
		// 	await this.projectService.updateProject(
		// 		projectId,
		// 		{
		// 			info: minedResult.info,
		// 			lightspot: minedResult.lightspot
		// 		},
		// 		userInfo
		// 	);
		// 	this.logger.log(`[Autoflow] 子步骤: 项目 ${projectId} mine分析完成。`);
		// }
		// this.logger.log(`[Autoflow] 所有分析任务已完成。`);
		//* 6. 存储结果简历并进行人岗匹配
		// 存储结果简历
		// const finalResume = await this.resumeService.create(
		// 	{
		// 		name: `自动流程结果简历-${Date.now()}`,
		// 		skill: results.skillId,
		// 		projects: results.projectIds
		// 	},
		// 	userInfo
		// );
		// this.logger.log(`[Autoflow] 子步骤: 简历已存储。`);
		// 等待并获取人岗匹配结果
		// 注意：这需要向量数据库中已有岗位数据。确保已运行过job_embedding任务。
		// const jobMatchTask = await this.hjmService.startJobMatchTask(
		// 	finalResume.id,
		// 	userInfo,
		// 	`autoflow-${finalResume.id}`
		// );
		// this.logger.log(`[Autoflow] 子步骤: 人岗匹配任务已启动, 任务ID: ${jobMatchTask.id}`);
		// const matchedJobs = await this._waitForTaskAndGetResult<RankedJob[]>(jobMatchTask.id);
		// this.logger.log(`[Autoflow] 子步骤: 人岗匹配任务完成, 找到 ${matchedJobs.length} 个岗位。`);
		//* 7. 整合所有结果用于生成报告
		// const originalResume = await this.resumeService.findOne(results.originalResumeId, userInfo);
		// 生成学习路线
		// const roadChain = await this.chainService.roadChain();
		// const road = await roadChain.invoke(
		// 	JSON.stringify({
		// 		resumeA: originalResume,
		// 		resumeB: finalResume
		// 	})
		// );
		// this.logger.log(`[Autoflow] 子步骤: 学习路线已生成。`);
		// 准备报告数据
		// const reportData = {
		// 	originalResume,
		// 	finalResume,
		// 	matchedJobs,
		// 	road
		// };
		//* 8. 生成并上传报告
		// const reportChain = await this.chainService.resultsToTextChain();
		// const reportChunk = await reportChain.invoke({
		// 	input: JSON.stringify(reportData)
		// });
		// const reportMarkdown = reportChunk.content.toString();
		// this.logger.log(`[Autoflow] 子步骤: 最终报告已生成。`);
		// const reportName = `resume-report-${userInfo.userId}-${Date.now()}.md`;
		// const reportUrl = await this.ossService.upload(reportName, reportMarkdown);
		// results.reportUrl = reportUrl;
		// this.logger.log(`[Autoflow] 步骤 4/4 完成: 报告已上传至OSS, URL: ${reportUrl}`);
		// return {
		// 	message: 'Autoflow process completed successfully.',
		// 	results
		// };
	}

	/**
	 * 轮询后台任务结果,并在任务完成时返回结果
	 * @param taskId 任务ID
	 * @param timeout 超时时间(毫秒)
	 * @returns 任务结果
	 */
	private async _waitForTaskAndGetResult<T>(taskId: string, timeout = 60000): Promise<T> {
		const startTime = Date.now();
		while (Date.now() - startTime < timeout) {
			const task = await this.taskQueueService.getTask(taskId);

			if (task?.status === 'completed') {
				if (!task.resultKey) {
					throw new Error(`任务 ${taskId} 已完成但没有结果键。`);
				}
				const result = await this.redisService.get(task.resultKey);
				if (!result) {
					throw new Error(`无法从Redis中找到任务 ${taskId} 的结果 (Key: ${task.resultKey})`);
				}
				return JSON.parse(result) as T;
			} else if (task?.status === 'failed') {
				throw new Error(`任务 ${taskId} 执行失败。`);
			}
			// 等待一段时间再查询
			await new Promise(resolve => setTimeout(resolve, 2000));
		}
		throw new Error(`等待任务 ${taskId} 超时。`);
	}
}
