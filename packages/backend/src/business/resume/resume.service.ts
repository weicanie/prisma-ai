import { Inject, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	JobVo,
	jsonMd_obj,
	MatchJobDto,
	PaginatedResumeMatchedResult,
	PaginatedResumesResult,
	ProjectVo,
	ResumeMatchedDto,
	resumeMatchedSchema,
	ResumeMatchedVo,
	ResumeStatus,
	ResumeVo,
	SelectedLLM,
	SkillVo,
	SseFunc,
	type SsePipeManager,
	StreamingChunk,
	updateProjectDto,
	UpdateResumeContentDto,
	UpdateSkillDto,
	UserFeedback,
	UserInfoFromToken,
	WithFuncPool
} from '@prisma-ai/shared';
import { Model, Types } from 'mongoose';
import { from, Observable } from 'rxjs';
import { ChainService } from '../../chain/chain.service';
import { HjmChainService } from '../../chain/hjm-chain.service';
import { EventBusService, EventList } from '../../EventBus/event-bus.service';
import { redisStoreResult } from '../../manager/sse-session-manager/sse-manager.service';
import { RedisService } from '../../redis/redis.service';
import { asyncMap } from '../../utils/awaitMap';
import { PopulateFields } from '../../utils/type';
import { CareerService } from '../career/career.service';
import { UpdateCareerDto } from '../career/dto/update-career.dto';
import { UpdateEducationDto } from '../education/dto/update-education.dto';
import { EducationService } from '../education/education.service';
import { Job, JobDocument } from '../job/entities/job.entity';
import { JobService } from '../job/job.service';
import { Project, ProjectDocument } from '../project/entities/project.entity';
import { ProjectService } from '../project/project.service';
import { Skill, SkillDocument } from '../skill/entities/skill.entity';
import { SkillService } from '../skill/skill.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Resume, ResumeDocument } from './entities/resume.entity';
import { ResumeMatched, ResumeMatchedDocument } from './entities/resumeMatched.entity';

@Injectable()
export class ResumeService implements WithFuncPool, OnModuleInit {
	@InjectModel(Resume.name)
	private resumeModel: Model<ResumeDocument>;
	@InjectModel(Project.name)
	private projectModel: Model<ProjectDocument>;
	@InjectModel(Job.name)
	private jobModel: Model<JobDocument>;
	@InjectModel(Skill.name)
	private skillModel: Model<SkillDocument>;
	@InjectModel(ResumeMatched.name)
	private resumeMatchedModel: Model<ResumeMatchedDocument>;

	public funcPool: Record<string, SseFunc>;

	poolName = 'ResumeService';

	logger = new Logger(ResumeService.name);

	constructor(
		public chainService: ChainService,
		public eventBusService: EventBusService,
		public redisService: RedisService,
		private readonly jobService: JobService,
		private readonly hjmChainService: HjmChainService,
		@Inject('SsePipeManager')
		private readonly sseManager: SsePipeManager,
		private readonly careerService: CareerService,
		private readonly educationService: EducationService,
		private readonly skillService: SkillService,
		private readonly projectService: ProjectService
	) {
		this.initFuncPool();
	}

	initFuncPool() {
		this.funcPool = {
			resumeMatchJob: this.resumeMatchJob.bind(this)
		};
	}

	onModuleInit() {
		this.sseManager.registerFuncPool(this);
	}

	async resumeMatchJob(
		input: MatchJobDto,
		userInfo: UserInfoFromToken,
		taskId: string,
		userFeedback: UserFeedback = { reflect: false, content: '' },
		model: SelectedLLM
	) {
		const resumeVo = await this.findOne(input.resume, userInfo);
		const jobVo = await this.jobService.findOne(input.job, userInfo);
		//储存：新建或更新
		this.eventBusService.once(EventList.taskCompleted, ({ task }) => {
			if (task.id !== taskId) {
				return; // 确保只接收当前任务的结果
			}
			//取出redis中的结果进行处理

			if (!task.resultKey) {
				this.logger.error(`${task.id}任务结果redis键不存在,数据获取失败`);
				return;
			}

			this.redisService
				.get(task.resultKey!)
				.then(redisStoreResult => {
					if (!redisStoreResult) {
						throw '任务结果不存在或已过期被清除';
					}
					return JSON.parse(redisStoreResult);
				})
				.then(result => {
					this._handleMatchResult(result, userInfo, resumeVo, jobVo);
				})
				.catch(error => {
					this.logger.error(`任务${task.resultKey}结果获取失败: ${error}`);
					throw error;
				});
		});

		const resume = {
			name: resumeVo.name,
			skill: resumeVo.skill,
			projects: resumeVo.projects
		};
		const job = {
			jobName: jobVo.jobName,
			companyName: jobVo.companyName,
			description: jobVo.description
		};

		const chainInput = {
			resume,
			job,
			userFeedback,
			userInfo
		};

		const chain = await this.hjmChainService.matchChain(true, model, userInfo);
		const resumeMatched = await chain.stream(chainInput);
		return from(resumeMatched) as Observable<StreamingChunk>;
	}

	/**
	 *
	 * @param resultRedis SSE任务完成后从redis中取出的结果
	 * @param userInfo 用户信息
	 * @param resume 用户输入简历信息
	 */
	private async _handleMatchResult(
		resultRedis: redisStoreResult,
		userInfo: UserInfoFromToken,
		resume: ResumeVo,
		job: JobVo
	) {
		// 1. 从Redis结果中解析出LLM的输出内容
		let matchedResume: ResumeMatchedDto = jsonMd_obj(resultRedis.content); // 从markdown代码块中提取json

		// 2. 使用Zod Schema验证解析出的JSON对象格式
		const validationResult = resumeMatchedSchema.safeParse(matchedResume);

		// 3. 如果验证失败,尝试使用LLM进行格式修复
		if (!validationResult.success) {
			const errorMessage = JSON.stringify(validationResult.error.format()); // 获取详细的Zod验证错误信息
			// 创建一个格式修复链
			const fomartFixChain = await this.chainService.fomartFixChain(
				resumeMatchedSchema,
				errorMessage,
				userInfo.userConfig!
			);
			const contentStr = JSON.stringify(matchedResume);
			// 调用链来修复格式
			matchedResume = await fomartFixChain.invoke({ input: contentStr });
		}
		// 4. 准备要存入数据库的数据
		const dataToSave = {
			name: matchedResume.name,
			// 构建符合Skill schema的skill对象
			skill: {
				name: resume.skill.name, // 使用原始简历的技能名称
				content: matchedResume.skill.content, // 使用LLM优化后的技能内容
				userInfo // 添加必需的userInfo字段
			},
			// 构建符合Project schema的projects数组
			projects: matchedResume.projects.map((matchedProject, index) => {
				const originalProject = resume.projects[index];
				return {
					name: originalProject.name, // 使用原始项目名称
					info: matchedProject.info, // 使用LLM优化后的项目信息
					lightspot: matchedProject.lightspot, // 使用LLM优化后的项目亮点
					status: 'matched', // 设置状态为matched
					userInfo, // 添加必需的userInfo字段
					// 如果原始项目有lookupResult，保留它
					...(originalProject?.lookupResult && {
						lookupResult: originalProject.lookupResult
					})
				};
			}),
			userInfo,
			status: ResumeStatus.matched,
			jobId: new Types.ObjectId(job.id)
		};
		// 用户该简历已存在则更新
		const existingResume = await this.resumeMatchedModel.findOne({
			'userInfo.userId': userInfo.userId,
			name: resume.name
		});

		let newMatchedResume: ResumeMatchedDocument;
		if (existingResume) {
			// 更新现有记录
			//@ts-expect-error 类型推导错误
			newMatchedResume = await this.resumeMatchedModel.findByIdAndUpdate(
				existingResume._id,
				dataToSave,
				{ new: true }
			);
		} else {
			// 创建新记录
			newMatchedResume = new this.resumeMatchedModel(dataToSave);
			await newMatchedResume.save();
		}

		/* 更新关联数据*/
		await this.resumeModel.updateOne(
			{ _id: new Types.ObjectId(resume.id) },
			{
				$set: {
					status: ResumeStatus.matched,
					resumeMatcheds: [...(resume.resumeMatcheds || []), newMatchedResume.id]
				}
			}
		);
		await this.jobModel.updateOne(
			{ _id: new Types.ObjectId(job.id) },
			{ $set: { resumeMatchedId: newMatchedResume.id } }
		);
	}

	/**
	 * 根据岗位ID查询专用简历
	 * @param jobId 岗位ID
	 * @returns 返回该岗位专用的简历,和普通简历格式是一样的,只是多了jobId字段
	 */
	async findResumeMatchedByJobId(jobId: string): Promise<ResumeVo> {
		const resumeMatched = await this.resumeMatchedModel
			.findOne({ jobId: new Types.ObjectId(jobId) })
			.exec();
		const resumeMatchedObj = resumeMatched?.toObject();
		if (!resumeMatchedObj) {
			throw new Error(`Resume matched with jobId "${jobId}" not found`);
		}
		const result = {
			id: resumeMatchedObj.id as string,
			name: resumeMatchedObj.name,
			status: resumeMatchedObj.status,
			skill: resumeMatchedObj.skill as unknown as SkillVo,
			projects: resumeMatchedObj.projects as unknown as ProjectVo[],
			createdAt: resumeMatchedObj.createdAt,
			updatedAt: resumeMatchedObj.updatedAt
		};
		return result as ResumeVo;
	}

	async findOneResumeMatched(id: string, userInfo: UserInfoFromToken): Promise<ResumeVo> {
		const resumeMatched = (await this.resumeMatchedModel
			.findOne({ _id: new Types.ObjectId(id), 'userInfo.userId': userInfo.userId })
			.exec()) as PopulateFields<
			ResumeDocument,
			'projects' | 'skill' | 'careers' | 'educations',
			{
				projects: ProjectDocument[];
				skill: SkillDocument;
			}
		> | null;
		if (!resumeMatched) {
			throw new Error(`Resume matched with id "${id}" not found`);
		}

		return resumeMatched as ResumeVo;
	}

	async create(
		createResumeDto: CreateResumeDto,
		userInfo: UserInfoFromToken
	): Promise<ResumeDocument> {
		const createdResume = new this.resumeModel({
			...createResumeDto,
			skill: new Types.ObjectId(createResumeDto.skill),
			projects: createResumeDto.projects?.map(id => new Types.ObjectId(id)),
			careers: createResumeDto.careers?.map(id => new Types.ObjectId(id)),
			educations: createResumeDto.educations?.map(id => new Types.ObjectId(id)),
			userInfo,
			status: ResumeStatus.committed
		});
		return createdResume.save();
	}

	async findAll(
		userInfo: UserInfoFromToken,
		page: number = 1,
		limit: number = 10
	): Promise<PaginatedResumesResult> {
		const skip = (page - 1) * limit;
		const query = { 'userInfo.userId': userInfo.userId };

		const [result, total] = await Promise.all([
			this.resumeModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
			this.resumeModel.countDocuments(query).exec()
		]);

		const promises = result.map(resume => this.findOne(resume._id.toString(), userInfo));
		let data = await Promise.all(promises);
		return {
			data,
			total,
			page,
			limit
		};
	}

	/**
	 * 分页查询用户的所有专用简历（ResumeMatched）
	 * @param userInfo 用户信息
	 * @param page 页码，默认为1
	 * @param limit 每页数量，默认为10
	 * @returns 返回分页后的专用简历列表
	 */
	async findAllResumeMatched(
		userInfo: UserInfoFromToken,
		page: number = 1,
		limit: number = 10
	): Promise<PaginatedResumeMatchedResult> {
		const skip = (page - 1) * limit;
		const query = { 'userInfo.userId': userInfo.userId };

		const [result, total] = await Promise.all([
			this.resumeMatchedModel
				.find(query)
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 })
				.populate('jobId')
				.exec(),
			this.resumeMatchedModel.countDocuments(query).exec()
		]);

		const data: ResumeMatchedVo[] = result.map(resumeMatched => {
			const resumeMatchedObj = resumeMatched.toObject();
			return {
				id: resumeMatchedObj.id as string,
				name: resumeMatchedObj.name,
				status: resumeMatchedObj.status,
				skill: resumeMatchedObj.skill as unknown as SkillVo,
				projects: resumeMatchedObj.projects as unknown as ProjectVo[],
				job: resumeMatchedObj.jobId as unknown as JobVo,
				jobId: resumeMatchedObj.jobId.id.toString(),
				createdAt: resumeMatchedObj.createdAt,
				updatedAt: resumeMatchedObj.updatedAt
			};
		});

		return {
			data,
			total,
			page,
			limit
		};
	}

	async findOne(id: string, userInfo: UserInfoFromToken): Promise<ResumeVo> {
		if (!Types.ObjectId.isValid(id)) {
			throw new NotFoundException(`Invalid ID format: "${id}"`);
		}
		const resume = (await this.resumeModel
			.findOne({
				_id: new Types.ObjectId(id),
				'userInfo.userId': userInfo.userId
			})
			.populate('skill')
			.populate('projects')
			.populate('careers')
			.populate('educations')
			.exec()) as PopulateFields<
			ResumeDocument,
			'projects' | 'skill' | 'careers' | 'educations',
			{
				projects: ProjectDocument[];
				skill: SkillDocument;
			}
		> | null;

		if (!resume) {
			throw new NotFoundException(`Resume with ID "${id}" not found or access denied`);
		}

		return resume as ResumeVo;
	}

	async update(
		id: string,
		updateResumeDto: UpdateResumeDto,
		userInfo: UserInfoFromToken
	): Promise<string> {
		if (!Types.ObjectId.isValid(id)) {
			throw new NotFoundException(`Invalid ID format: "${id}"`);
		}
		const updateData: any = { ...updateResumeDto };
		if (updateResumeDto.skill) {
			updateData.skill = new Types.ObjectId(updateResumeDto.skill);
		}
		if (updateResumeDto.projects) {
			updateData.projects = updateResumeDto.projects.map(
				projectId => new Types.ObjectId(projectId)
			);
		}
		if (updateResumeDto.educations) {
			updateData.educations = updateResumeDto.educations.map(
				educationId => new Types.ObjectId(educationId)
			);
		}
		if (updateResumeDto.careers) {
			updateData.careers = updateResumeDto.careers.map(careerId => new Types.ObjectId(careerId));
		}

		const newResume = await this.resumeModel
			.findByIdAndUpdate(
				id,
				{
					$set: updateData
				},
				{ new: true }
			)
			.exec();

		if (!newResume) {
			throw new NotFoundException(`Resume with ID "${id}" not found or access denied`);
		}

		return '更新成功';
	}

	async updateFromContent(
		id: string,
		updateResumeContentDto: UpdateResumeContentDto,
		userInfo: UserInfoFromToken
	): Promise<string> {
		try {
			const { name, skill, projects, careers, educations } = updateResumeContentDto;
			if (name) {
				await this.resumeModel.findByIdAndUpdate(id, { $set: { name } }, { new: true });
			}
			if (skill) {
				await this.skillService.update(skill.id, skill as UpdateSkillDto, userInfo);
			}
			if (projects) {
				await asyncMap(projects, async project => {
					await this.projectService.updateProject(
						project.id,
						project as updateProjectDto,
						userInfo
					);
				});
			}
			if (careers) {
				await asyncMap(careers, async career => {
					await this.careerService.update(career.id, career as UpdateCareerDto, userInfo);
				});
			}
			if (educations) {
				await asyncMap(educations, async education => {
					await this.educationService.update(
						education.id,
						education as UpdateEducationDto,
						userInfo
					);
				});
			}
			return '更新成功';
		} catch (error) {
			throw Error('更新失败' + error.message);
		}
	}

	async remove(id: string, userInfo: UserInfoFromToken) {
		if (!Types.ObjectId.isValid(id)) {
			throw new NotFoundException(`Invalid ID format: "${id}"`);
		}
		const result = await this.resumeModel
			.deleteOne({
				_id: new Types.ObjectId(id),
				'userInfo.userId': userInfo.userId
			})
			.exec();
		if (result.deletedCount === 0) {
			throw new NotFoundException(`Resume with ID "${id}" not found or access denied`);
		}
	}

	async removeResumeMatched(id: string, userInfo: UserInfoFromToken) {
		if (!Types.ObjectId.isValid(id)) {
			throw new NotFoundException(`Invalid ID format: "${id}"`);
		}
		const result = await this.resumeMatchedModel
			.deleteOne({
				_id: new Types.ObjectId(id),
				'userInfo.userId': userInfo.userId
			})
			.exec();
		if (result.deletedCount === 0) {
			throw new NotFoundException(`Resume matched with ID "${id}" not found or access denied`);
		}
	}
}
