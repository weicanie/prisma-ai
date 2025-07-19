import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	jsonMd_obj,
	lookupResultSchema,
	SelectedLLM,
	ProjectDto,
	projectLookupedDto,
	projectMinedSchema,
	projectPolishedSchema,
	projectSchema,
	ProjectStatus,
	ProjectVo,
	StreamingChunk,
	UserFeedback,
	UserInfoFromToken
} from '@prism-ai/shared';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { ZodSchema } from 'zod';
import { ChainService } from '../../chain/chain.service';
import { ProjectChainService } from '../../chain/project-chain.service';
import { EventBusService, EventList } from '../../EventBus/event-bus.service';
import { RedisService } from '../../redis/redis.service';
import { WithFuncPool } from '../../utils/abstract';
import { SseFunc } from '../../utils/type';
import { SkillService } from '../skill/skill.service';
import { redisStoreResult } from '../sse/llm-sse.service';
import { Project, ProjectDocument } from './entities/project.entity';
import { ProjectMined, ProjectMinedDocument } from './entities/projectMined.entity';
import { ProjectPolished, ProjectPolishedDocument } from './entities/projectPolished.entity';

@Injectable()
export class ProjectProcessService implements WithFuncPool {
	@InjectModel(Project.name)
	private projectModel: Model<ProjectDocument>;

	@InjectModel(ProjectPolished.name)
	private projectPolishedModel: Model<ProjectPolishedDocument>;

	@InjectModel(ProjectMined.name)
	private projectMinedModel: Model<ProjectMinedDocument>;
	public funcKeys = {
		polishProject: 'polishProject',
		mineProject: 'mineProject',
		lookupProject: 'lookupProject'
	};
	logger = new Logger(ProjectProcessService.name);

	public funcPool: Record<string, SseFunc>;
	poolName = 'ProjectProcessService';

	constructor(
		public chainService: ChainService,
		public projectChainService: ProjectChainService,
		public eventBusService: EventBusService,
		public redisService: RedisService,
		public skillService: SkillService
	) {
		this.funcPool = {
			polishProject: this.polishProject.bind(this),
			mineProject: this.mineProject.bind(this),
			lookupProject: this.lookupProject.bind(this)
		};
	}

	/**
	 * 在生成任务结束时检查、储存结果到数据库
	 * @param schema 验证用的 zod schema
	 * @param model 存储用的 mongoose 模型
	 * @param userInfo 用户信息
	 * @param status 结果应处于的状态
	 * @param statusMerged 合并后的结果应处于的状态
	 * @param inputSchema 输入数据的 zod schema
	 * @param existingProjectId 已存在的项目ID
	 * @returns 返回一个处理函数，接收redis存储的结果将其存储到数据库
	 */
	private _resultHandlerCreater = async (
		schema: ZodSchema,
		model: typeof Model,
		userInfo: UserInfoFromToken,
		status: ProjectStatus,
		statusMerged: ProjectStatus,
		inputSchema = projectSchema,
		existingProjectId: ProjectDocument
	) => {
		//格式验证及修复、数据库存储
		return async (resultRedis: redisStoreResult) => {
			let results = jsonMd_obj(resultRedis.content); //[合并前,合并后]

			let result = results[0];
			const validationResult = schema.safeParse(result);
			if (!validationResult.success) {
				const errorMessage = JSON.stringify(validationResult.error.format());
				const fomartFixChain = await this.chainService.fomartFixChain(schema, errorMessage);
				const projectPolishedStr = JSON.stringify(result);
				result = await fomartFixChain.invoke({ input: projectPolishedStr });
			}

			const resultSave = { ...result, status, userInfo };
			const resultSave_model = new model(resultSave);

			let resultAfterMerge: ProjectDto = results[1];
			const inputValidationResult = inputSchema.safeParse(resultAfterMerge);
			if (!inputValidationResult.success) {
				const errorMessage = JSON.stringify(inputValidationResult.error.format());
				const fomartFixChain = await this.chainService.fomartFixChain(inputSchema, errorMessage);
				const projectPolishedStr = JSON.stringify(resultAfterMerge);
				resultAfterMerge = await fomartFixChain.invoke({
					input: projectPolishedStr
				});
			}
			/* 更新项目（暂时不再自动更新评分,因为用户可能需要反馈、重做） */
			//先删除原评分然后保存、返回, 异步更新评分-这样可以大大减少用户等待时间-但分析结果无法保证能用于下一次优化,比如mine
			// const resultSaveAfterMerge = {
			// 	...resultAfterMerge,
			// 	status: statusMerged
			// };
			await this.projectModel.updateOne(
				{ _id: existingProjectId.id },
				{
					$set: {
						status: statusMerged,
						info: resultAfterMerge.info,
						lightspot: resultAfterMerge.lightspot,
						lookupResult: null
					}
				}
			);

			await resultSave_model.save();
		};
	};

	/**
	 * 项目经验文本转换为json格式对象并提交
	 * @param projectText 项目经验文本
	 * @returns
	 */
	async transformAndCheckProject(
		projectText: string,
		userInfo: UserInfoFromToken
	): Promise<Omit<ProjectVo, 'lookupResult'>> {
		const chain = await this.chainService.tansformChain();
		const project = await chain.invoke({ input: projectText });

		return await this.checkoutProject(project, userInfo);
	}

	/**
	 * 验证项目数据格式
	 * 	若通过验证则将数据储存到数据库
	 * 	否则抛出错误
	 */
	async checkoutProject(
		project: ProjectDto,
		userInfo: UserInfoFromToken
	): Promise<Omit<ProjectVo, 'lookupResult'>> {
		//保证用户的项目名称唯一
		const query = {
			'info.name': project.info.name
		};
		const existingProject = await this.projectModel.findOne(query).exec();
		if (existingProject) {
			throw new Error(
				`项目名称为 ${project.info.name} 的项目经验已存在，请修改项目名称后重新提交。`
			);
		}

		const zodSchema = projectSchema;
		const model = this.projectModel;

		try {
			zodSchema.parse(project);
		} catch (error) {
			console.error('zod schema验证失败:', error);
			throw error;
		}

		const dataToSave = {
			...project,
			status: ProjectStatus.committed,
			userInfo
		};
		const newModel = new model(dataToSave);
		await newModel.save();
		return { ...newModel.toObject() } as Omit<ProjectVo, 'lookupResult'>;
	}

	/**
	 * 分析项目经验存在的问题和解决方案
	 */
	async lookupProject(
		project: ProjectDto,
		userInfo: UserInfoFromToken,
		taskId: string,
		userFeedback: UserFeedback = { reflect: false, content: '' },
		model: SelectedLLM
	): Promise<Observable<StreamingChunk>> {
		const existingPolishingProject = await this.projectPolishedModel
			.findOne({
				'info.name': project.info.name,
				'userInfo.userId': userInfo.userId
			})
			.exec();
		//删除现存的打磨后的项目经验
		if (existingPolishingProject) {
			await this.projectPolishedModel.deleteOne({ _id: existingPolishingProject._id });
		}

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
				.then(result => this._handleLookupResult(result, userInfo, project))
				.catch(error => {
					this.logger.error(`任务${task.resultKey}结果获取失败: ${error}`);
					throw error;
				});
		});

		const chain = await this.projectChainService.lookupChain(true, model);
		const lookupStream = await chain.stream({
			project,
			userInfo,
			userFeedback
		});

		// 业务层不再关心模型细节，直接返回标准化的 StreamingChunk 流
		return from(lookupStream) as Observable<StreamingChunk>;
	}

	/**
	 * @param resultRedis SSE任务完成后从redis中取出的结果
	 * @param userInfo 用户信息
	 * @param project 用户输入项目信息
	 */
	private _handleLookupResult = async (
		resultRedis: redisStoreResult,
		userInfo: UserInfoFromToken,
		project: ProjectDto
	) => {
		// 1. 从Redis结果中解析出LLM的输出内容
		let lookupResult = jsonMd_obj(resultRedis.content); // 从markdown代码块中提取json

		// 2. 使用Zod Schema验证解析出的JSON对象格式
		const validationResult = lookupResultSchema.safeParse(lookupResult);

		// 3. 如果验证失败,尝试使用LLM进行格式修复
		if (!validationResult.success) {
			const errorMessage = JSON.stringify(validationResult.error.format()); // 获取详细的Zod验证错误信息
			// 创建一个格式修复链
			const fomartFixChain = await this.chainService.fomartFixChain(
				lookupResultSchema,
				errorMessage
			);
			const projectPolishedStr = JSON.stringify(lookupResult);
			// 调用链来修复格式
			lookupResult = await fomartFixChain.invoke({ input: projectPolishedStr });
		}

		// 4. 准备要存入数据库的数据
		const lookupResultSave = {
			...lookupResult,
			userInfo,
			projectName: project.info.name
		};

		// 5. 根据是否存在旧记录，执行更新或新建操作
		const updateOperation = {
			$set: { status: ProjectStatus.lookuped, lookupResult: lookupResultSave }
		};
		const query = {
			'info.name': project.info.name,
			'userInfo.userId': userInfo.userId
		};

		await this.projectModel.updateOne(query, updateOperation);
	};

	/**
	 * 项目经验 -> 打磨后的项目经验
	 * @param project 项目经验
	 * @param userInfo 用户信息
	 * @param taskId 任务ID
	 */
	async polishProject(
		project: projectLookupedDto,
		userInfo: UserInfoFromToken,
		taskId: string,
		userFeedback: UserFeedback = { reflect: false, content: '' },
		model: SelectedLLM
	): Promise<Observable<StreamingChunk>> {
		const existingPolishingProject = await this.projectPolishedModel
			.findOne({
				'info.name': project.info.name,
				'userInfo.userId': userInfo.userId
			})
			.exec();

		const existingProject: ProjectDocument | null = await this.projectModel
			.findOne({
				'info.name': project.info.name,
				'userInfo.userId': userInfo.userId
			})
			.exec();

		if (existingPolishingProject) {
			if (!userFeedback.reflect) {
				return from(
					Promise.resolve({
						content: `\`\`\`json\n[${JSON.stringify(existingPolishingProject)},${JSON.stringify(existingProject)}]\n\`\`\``, //与llm返回格式保持一致,前端统一解析
						done: true,
						isReasoning: false
					})
				);
			} else {
				await this.projectPolishedModel.deleteOne({ _id: existingPolishingProject._id });
			}
		}

		const resultHandler = await this._resultHandlerCreater(
			projectPolishedSchema,
			this.projectPolishedModel,
			userInfo,
			ProjectStatus.polishing,
			ProjectStatus.polished,
			projectSchema,
			existingProject!
		);

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
				.then(result => resultHandler(result))
				.catch(error => {
					this.logger.error(`任务${task.resultKey}结果获取失败: ${error}`);
					throw error;
				});
		});

		const chain = await this.projectChainService.polishChain(true, model);
		let projectPolished = await chain.stream({
			project,
			userInfo,
			userFeedback
		});
		return from(projectPolished) as Observable<StreamingChunk>;
	}

	/**
	 * 项目经验 -> 挖掘后的项目经验
	 * @param project 项目经验
	 * @param userInfo 用户信息
	 * @param taskId 任务ID
	 */
	async mineProject(
		project: ProjectDto,
		userInfo: UserInfoFromToken,
		taskId: string,
		userFeedback: UserFeedback = { reflect: false, content: '' },
		model: SelectedLLM
	): Promise<Observable<StreamingChunk>> {
		const existingMiningProject = await this.projectMinedModel
			.findOne({
				'info.name': project.info.name,
				'userInfo.userId': userInfo.userId
			})
			.exec();

		const existingProject = await this.projectModel
			.findOne({
				'info.name': project.info.name,
				'userInfo.userId': userInfo.userId
			})
			.exec();

		if (existingMiningProject) {
			await this.projectMinedModel.deleteOne({ _id: existingMiningProject._id });
		}

		const resultHandler = await this._resultHandlerCreater(
			projectMinedSchema,
			this.projectMinedModel,
			userInfo,
			ProjectStatus.mining,
			ProjectStatus.mined,
			projectSchema,
			existingProject!
		);

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
				.then(result => resultHandler(result))
				.catch(error => {
					this.logger.error(`任务${task.resultKey}结果获取失败: ${error}`);
					throw error;
				});
		});

		const chain = await this.projectChainService.mineChain(
			true,
			model,
			userInfo,
			this.skillService
		);
		let projectMined = await chain.stream({
			project,
			userInfo,
			userFeedback
		});
		return from(projectMined) as Observable<StreamingChunk>;
	}
}
