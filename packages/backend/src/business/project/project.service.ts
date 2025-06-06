import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	jsonMd_obj,
	lookupResultSchema,
	projectMinedSchema,
	projectPolishedSchema,
	projectSchema,
	ProjectStatus,
	ProjectVo,
	RequestTargetMap,
	StreamingChunk,
	UserInfoFromToken
} from '@prism-ai/shared';
import { Model } from 'mongoose';
import { from, mergeMap, Observable } from 'rxjs';
import { ZodSchema } from 'zod';
import { ChainService } from '../../chain/chain.service';
import { EventBusService, EventList } from '../../EventBus/event-bus.service';
import { redisStoreResult } from '../../sse/sse.service';
import { RedisService } from './../../redis/redis.service';
import { ProjectDto } from './dto/project.dto';
import { LookupResult, LookupResultDocument } from './entities/lookupResult.entity';
import { Project, ProjectDocument } from './entities/project.entity';
import { ProjectMined, ProjectMinedDocument } from './entities/projectMined.entity';
import { ProjectPolished, ProjectPolishedDocument } from './entities/projectPolished.entity';

//FIXME 用validation pipe 结合 zodSchema生成的 dto验证用户上传的数据格式
// 其它用于验证llm生成的数据格式和指定数据格式

interface DeepSeekStreamChunk {
	id: string;
	content: string | ''; //生成内容
	additional_kwargs: {
		reasoning_content: string | null; //推理内容
	};
	tool_calls: [];
	tool_call_chunks: [];
	invalid_tool_calls: [];
}

interface DeepSeekStreamChunkEnd {
	id: string;
	content: '';
	additional_kwargs: {
		reasoning_content: null;
	};
	response_metadata: {
		/* token消耗详情 */
		usage: {
			prompt_tokens: number;
			completion_tokens: number;
			total_tokens: number;
			prompt_tokens_details: {
				cached_tokens: number;
			};
			completion_tokens_details: {
				reasoning_tokens: number;
			};
		};
	};
	tool_calls: [];
	tool_call_chunks: [];
	invalid_tool_calls: [];
}

@Injectable()
export class ProjectService {
	@InjectModel(Project.name)
	private projectModel: Model<ProjectDocument>;

	@InjectModel(ProjectPolished.name)
	private projectPolishedModel: Model<ProjectPolishedDocument>;

	@InjectModel(ProjectMined.name)
	private projectMinedModel: Model<ProjectMinedDocument>;

	@InjectModel(LookupResult.name)
	private lookupResultModel: Model<LookupResultDocument>;

	logger = new Logger(ProjectService.name);

	/* 用于llm任务处理器根据上下文中的type字段调用指定方法 */
	public target_method: Record<keyof typeof RequestTargetMap, string> = {
		polish: 'polishProject',
		mine: 'mineProject',
		lookup: 'lookupProject'
	};

	constructor(
		public chainService: ChainService,
		public eventBusService: EventBusService,
		public redisService: RedisService
	) {}

	/**
	 * 在生成任务结束时检查、储存结果到数据库
	 * @param schema 验证用的 zod schema
	 * @param model 存储用的 mongoose 模型
	 * @param userInfo 用户信息
	 * @param status 结果应处于的状态
	 * @param statusMerged 合并后的结果应处于的状态
	 * @param inputSchema 输入数据的 zod schema
	 * @returns 返回一个处理函数，接收redis存储的结果将其存储到数据库
	 */
	private async resultHandlerCreater(
		schema: ZodSchema,
		model: typeof Model,
		userInfo: UserInfoFromToken,
		status: `${ProjectStatus}`,
		statusMerged: `${ProjectStatus}`,
		inputSchema = projectSchema,
		existingProjectId: ProjectDocument
	) {
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

			let resultAfterMerge = results[1];
			const inputValidationResult = inputSchema.safeParse(resultAfterMerge);
			if (!inputValidationResult.success) {
				const errorMessage = JSON.stringify(inputValidationResult.error.format());
				const fomartFixChain = await this.chainService.fomartFixChain(inputSchema, errorMessage);
				const projectPolishedStr = JSON.stringify(resultAfterMerge);
				resultAfterMerge = await fomartFixChain.invoke({ input: projectPolishedStr });
			}

			const resultSaveAfterMerge = { ...resultAfterMerge, status: statusMerged };
			/* 更新项目,包括评分 */
			//TODO 提醒用户评分更新会有有延迟
			this.updateProject(existingProjectId.id, resultSaveAfterMerge, userInfo);
			await resultSave_model.save();
		};
	}

	/**
	 * 项目经验转换为json格式对象并提交
	 * @param project 项目经验
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
	 * 验证数据格式
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
		const data = project;

		try {
			zodSchema.parse(project);
		} catch (error) {
			// const dataToSave = { ...data, status: ProjectStatus.refuse, userInfo };
			// await new model(dataToSave).save();

			// if (error instanceof ZodError) {
			// 	const errorMessage = JSON.stringify(error.format());
			// 	throw new Error(ErrorCode.FORMAT_ERROR + `${errorMessage}`);
			// }
			console.error('zod schema验证失败:', error);
			throw error;
		}

		const dataToSave = { ...project, status: ProjectStatus.committed, userInfo };
		const newModel = new model(dataToSave);
		await newModel.save();
		return { ...newModel.toObject() } as Omit<ProjectVo, 'lookupResult'>;
	}

	//TODO 从deepseek模型sse返回数据代码抽取封装
	/**
	 * 分析项目经验存在的问题和解决方案
	 */
	async lookupProject(
		project: ProjectDto,
		userInfo: UserInfoFromToken,
		taskId: string
	): Promise<Observable<StreamingChunk | undefined>> {
		const existingLookupResult = await this.lookupResultModel
			.findOne({
				'userInfo.userId': userInfo.userId,
				projectName: project.info.name
			})
			.exec();

		//储存：新建或更新
		const handler = async (resultRedis: redisStoreResult) => {
			let lookupResult = jsonMd_obj(resultRedis.content); //分析的思考结果、结果
			const validationResult = lookupResultSchema.safeParse(lookupResult);
			if (!validationResult.success) {
				const errorMessage = JSON.stringify(validationResult.error.format());
				const fomartFixChain = await this.chainService.fomartFixChain(
					lookupResultSchema,
					errorMessage
				);
				const projectPolishedStr = JSON.stringify(lookupResult);
				lookupResult = await fomartFixChain.invoke({ input: projectPolishedStr });
			}
			const lookupResultSave = { ...lookupResult, userInfo, projectName: project.info.name };
			if (existingLookupResult) {
				// 更新
				await this.lookupResultModel.updateOne({ _id: existingLookupResult._id }, lookupResultSave);
			} else {
				// 新建
				const lookupResult_model = new this.lookupResultModel(lookupResultSave);
				//更新项目状态
				await this.projectModel.updateOne(
					{ 'info.name': project.info.name, 'userInfo.userId': userInfo.userId },
					{ $set: { status: ProjectStatus.lookuped } }
				);
				await lookupResult_model.save();
			}
		};

		this.eventBusService.once(EventList.taskCompleted, ({ task }) => {
			if (task.id !== taskId) {
				return; // 确保只接收当前任务的结果
			}
			//取出redis中的结果进行处理

			if (!task.resultKey) {
				this.logger.error(`${task.id}任务结果键不存在,数据库储存失败`);
			}

			this.redisService
				.get(task.resultKey!)
				.then(redisStoreResult => {
					if (!redisStoreResult) {
						throw '任务结果不存在或已过期被清除';
					}
					return JSON.parse(redisStoreResult);
				})
				.then(result => handler.bind(this)(result))
				.catch(error => {
					this.logger.error(`任务${task.resultKey}处理结果失败: ${error}`);
				});
		});

		const chain = await this.chainService.lookupChain(true);
		const projectStr = JSON.stringify(project);
		const lookupStream = await chain.stream(projectStr);

		return from(lookupStream).pipe(
			mergeMap(async (chunk: DeepSeekStreamChunk) => {
				const done = !chunk.content && chunk.additional_kwargs.reasoning_content === null;
				const isReasoning = chunk.additional_kwargs.reasoning_content !== null;
				return {
					content: !isReasoning ? chunk.content : '',
					reasonContent: isReasoning ? chunk.additional_kwargs?.reasoning_content! : '',
					done,
					isReasoning
				};
			})
		);
	}

	/**
	 * 项目经验 -> 打磨后的项目经验
	 * @param project 项目经验
	 * @param userInfo 用户信息
	 * @param taskId 任务ID
	 */
	async polishProject(
		project: ProjectDto,
		userInfo: UserInfoFromToken,
		taskId: string
	): Promise<Observable<StreamingChunk | undefined>> {
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
			return from(
				Promise.resolve({
					content: `\`\`\`json\n[${JSON.stringify(existingProject)},${JSON.stringify(existingPolishingProject)}]\n\`\`\``, //与llm返回格式保持一致,前端统一解析
					done: true,
					isReasoning: false
				})
			);
		}

		const resultHandler = await this.resultHandlerCreater(
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
				this.logger.error(`${task.id}任务结果键不存在,数据库储存失败`);
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
					this.logger.error(`任务${task.resultKey}处理结果失败: ${error}`);
				});
		});

		const chain = await this.chainService.polishChain(true);
		const projectStr = JSON.stringify(project);
		let projectPolished = await chain.stream(projectStr);
		return from(projectPolished).pipe(
			mergeMap(async (chunk: DeepSeekStreamChunk) => {
				const done = !chunk.content && chunk.additional_kwargs.reasoning_content === null;
				const isReasoning = chunk.additional_kwargs.reasoning_content !== null;
				return {
					content: !isReasoning ? chunk.content : '',
					reasonContent: isReasoning ? chunk.additional_kwargs?.reasoning_content! : '',
					done,
					isReasoning
				};
			})
		);
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
		taskId: string
	): Promise<Observable<StreamingChunk | undefined>> {
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
			return from(
				Promise.resolve({
					content: `\`\`\`json\n[${JSON.stringify(existingProject)},${JSON.stringify(existingMiningProject)}]\n\`\`\``, //与llm返回格式保持一致,前端统一解析
					done: true,
					isReasoning: false
				})
			);
		}

		const resultHandler = await this.resultHandlerCreater(
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
				this.logger.error(`${task.id}任务结果键不存在,数据库储存失败`);
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
					this.logger.error(`任务${task.resultKey}处理结果失败: ${error}`);
				});
		});

		const chain = await this.chainService.mineChain(true);
		const projectStr = JSON.stringify(project);
		let projectMined = await chain.stream(projectStr);
		return from(projectMined).pipe(
			mergeMap(async (chunk: DeepSeekStreamChunk) => {
				const done = !chunk.content && chunk.additional_kwargs.reasoning_content === null;
				const isReasoning = chunk.additional_kwargs.reasoning_content !== null;
				return {
					content: !isReasoning ? chunk.content : '',
					reasonContent: isReasoning ? chunk.additional_kwargs?.reasoning_content! : '',
					done,
					isReasoning
				};
			})
		);
	}

	async findAllProjects(userInfo: UserInfoFromToken): Promise<ProjectVo[]> {
		//并行查询
		const projects = await this.projectModel.find({ 'userInfo.userId': userInfo.userId }).exec();
		if (!projects || projects.length === 0) {
			return [];
		}
		const promises = projects.map(project => {
			return this.lookupResultModel
				.findOne({
					'userInfo.userId': userInfo.userId,
					projectName: project.info.name
				})
				.exec();
		});
		const LookupResults = await Promise.allSettled(promises);
		const projectDatas = projects.map(project => {
			const lookupResult = LookupResults.find(
				result => result.status === 'fulfilled' && result.value?.projectName === project.info.name
			);
			if (lookupResult && lookupResult.status === 'fulfilled') {
				return { ...project.toObject(), lookupResult: lookupResult.value };
			}
			return { ...project.toObject(), lookupResult: {} };
		});
		return projectDatas as ProjectVo[];
	}

	/**
	 * 根据ID获取项目经验, 只查询 projectModel
	 * @param id 项目ID
	 * @returns 查询结果
	 */
	async findProjectById(id: string, userInfo: UserInfoFromToken): Promise<ProjectVo> {
		const query = { _id: id, 'userInfo.userId': userInfo.userId };
		const project = await this.projectModel.findOne(query).exec();

		if (!project) {
			throw new Error(`ID为${id}的项目经验不存在`);
		} else {
			const lookupResult = await this.lookupResultModel
				.findOne({
					'userInfo.userId': userInfo.userId,
					projectName: project.info.name
				})
				.exec();
			return {
				...project.toObject(),
				lookupResult: {
					problem: lookupResult!.problem,
					solution: lookupResult!.solution,
					score: lookupResult!.score
				}
			} as ProjectVo;
		}
	}

	/**
	 * 获取指定状态的项目经验
	 * @param status 项目状态
	 * @param name 项目名称
	 * @returns 查询结果
	 */
	async findByNameAndStatus(
		name: string | undefined,
		status: `${ProjectStatus}`,
		userInfo: UserInfoFromToken
	): Promise<ProjectVo | undefined> {
		const query: any = { 'userInfo.userId': userInfo.userId, status };
		if (name) {
			query['info.name'] = { $regex: name, $options: 'i' }; // 不区分大小写
		}
		//projectPolishedModel里只有状态为polishing的项目
		//projectMinedModel里只有状态为mining的项目
		const promises = [
			this.projectMinedModel.findOne(query).exec(),
			this.projectPolishedModel.findOne(query).exec(),
			this.projectModel.findOne(query).exec()
		];

		const results = await Promise.allSettled(promises);
		const project = results.find(result => result.status === 'fulfilled' && result.value !== null);
		if (!project) {
			throw new Error(`名为${name}状态为${status}的项目经验不存在`);
		} else if (project.status === 'fulfilled') {
			const lookupResult = await this.lookupResultModel
				.findOne({
					'userInfo.userId': userInfo.userId,
					projectName: project.value!.info.name
				})
				.exec();
			return {
				...project.value,
				lookupResult: {
					problem: lookupResult!.problem,
					solution: lookupResult!.solution,
					score: lookupResult!.score
				}
			} as ProjectVo;
		}
	}

	/**
	 * 非流式分析项目
	 */
	async lookupProjectUnStream(project: ProjectDto, userInfo: UserInfoFromToken) {
		const chain = await this.chainService.lookupChain();
		const projectStr = JSON.stringify(project);
		let result = await chain.invoke(projectStr);
		let lookupResult: LookupResult = { ...result, userInfo, projectName: project.info.name };
		// 格式验证
		const validationResult = lookupResultSchema.safeParse(lookupResult);
		if (!validationResult.success) {
			const errorMessage = JSON.stringify(validationResult.error.format());
			const fomartFixChain = await this.chainService.fomartFixChain(
				lookupResultSchema,
				errorMessage
			);
			const lookupResultStr = JSON.stringify(lookupResult);
			lookupResult = await fomartFixChain.invoke({ input: lookupResultStr });
		}
		const existingLookupResult = await this.lookupResultModel
			.findOne({
				'userInfo.userId': userInfo.userId,
				projectName: project.info.name
			})
			.exec();
		const lookupResultSave = { ...lookupResult, userInfo, projectName: project.info.name };

		if (existingLookupResult) {
			// 更新
			await this.lookupResultModel.updateOne({ _id: existingLookupResult._id }, lookupResultSave);
		} else {
			// 新建
			const lookupResult_model = new this.lookupResultModel(lookupResultSave);
			//更新可能需要更新的项目状态
			await this.projectModel.updateOne(
				{ 'info.name': project.info.name, 'userInfo.userId': userInfo.userId },
				{ $set: { status: ProjectStatus.lookuped } }
			);
			await lookupResult_model.save();
		}
	}

	/**
	 * 更新项目经验
	 */
	async updateProject(
		id: string,
		updateProjectDto: Partial<ProjectDto>,
		userInfo: UserInfoFromToken
	): Promise<ProjectVo> {
		const existingProject = await this.projectModel
			.findOneAndUpdate(
				{ _id: id, 'userInfo.userId': userInfo.userId },
				{ $set: updateProjectDto },
				{ new: true }
			)
			.exec();
		if (!existingProject) {
			throw new Error(`Project with ID "${id}" not found or user unauthorized.`);
		}
		const projectToLookup = {
			info: existingProject.info,
			lightspot: existingProject.lightspot
		};

		const lookupResult = await this.lookupProjectUnStream(projectToLookup as ProjectDto, userInfo);

		return { ...existingProject, lookupResult } as ProjectVo;
	}

	/**
	 * 删除项目经验
	 */
	async deleteProject(
		id: string,
		userInfo: UserInfoFromToken
	): Promise<{ deleted: boolean; id?: string }> {
		const result = await this.projectModel
			.deleteOne({ _id: id, 'userInfo.userId': userInfo.userId })
			.exec();
		if (result.deletedCount === 0) {
			throw new Error(`Project with ID "${id}" not found or user unauthorized.`);
		}
		//TODO 删除相关的拷打、挖掘和打磨数据
		return { deleted: true, id };
	}

	/**
	 * mcp tool 查询数据库
	 * @param query 查询语句
	 * @returns 查询结果
	 */
	async toolQuery(query: string) {
		try {
			if (!query || typeof query !== 'string') {
				return {
					code: '查询语句不能为空',
					message: '查询语句不能为空',
					data: null
				};
			}

			const chain = await this.chainService.queryChain();
			const result = await chain.invoke(query);
			return {
				code: 0,
				message: '查询成功',
				data: result
			};
		} catch (error) {
			console.error('查询数据库失败:', error);
			return {
				code: '查询数据库失败',
				message: `查询数据库失败: ${error instanceof Error ? error.message : String(error)}`,
				data: null
			};
		}
	}
}
