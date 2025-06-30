import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { lookupResultSchema, ProjectStatus, ProjectVo, UserInfoFromToken } from '@prism-ai/shared';
import { Model } from 'mongoose';
import { ChainService } from '../../chain/chain.service';
import { ProjectChainService } from '../../chain/project-chain.service';
import { EventBusService } from '../../EventBus/event-bus.service';
import { RedisService } from './../../redis/redis.service';
import { ProjectDto } from './dto/project.dto';
import { Project, ProjectDocument } from './entities/project.entity';
import { ProjectMined, ProjectMinedDocument } from './entities/projectMined.entity';
import { ProjectPolished, ProjectPolishedDocument } from './entities/projectPolished.entity';

//FIXME 用validation pipe 结合 zodSchema生成的 dto验证用户上传的数据格式
// 其它用于验证llm生成的数据格式和指定数据格式

@Injectable()
export class ProjectService {
	@InjectModel(Project.name)
	private projectModel: Model<ProjectDocument>;

	@InjectModel(ProjectPolished.name)
	private projectPolishedModel: Model<ProjectPolishedDocument>;

	@InjectModel(ProjectMined.name)
	private projectMinedModel: Model<ProjectMinedDocument>;

	logger = new Logger(ProjectService.name);

	constructor(
		public chainService: ChainService,
		public eventBusService: EventBusService,
		public redisService: RedisService,
		public projectChainService: ProjectChainService
	) {}

	async findAllProjects(userInfo: UserInfoFromToken): Promise<ProjectVo[]> {
		//并行查询
		const projects = await this.projectModel.find({ 'userInfo.userId': userInfo.userId }).exec();
		if (!projects || projects.length === 0) {
			return [];
		}
		return projects as ProjectVo[];
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
			return {
				...project.toObject()
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
			return {
				...project.value?.toObject()
			} as ProjectVo;
		}
	}

	/**
	 * 非流式分析项目
	 */
	private async lookupProjectUnStream(project: ProjectDocument, userInfo: UserInfoFromToken) {
		const chain = await this.projectChainService.lookupChain(false);
		let [result] = await chain.invoke({
			project: project.toObject() as ProjectDto,
			userFeedback: { reflect: false, content: '' },
			userInfo
		});
		let lookupResult = { ...result, userInfo, projectName: project.info.name };
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
		const existingProject = await this.projectModel
			.findOne({
				'userInfo.userId': userInfo.userId,
				'info.name': project.info.name
			})
			.exec();
		const existingLookupResult = existingProject?.lookupResult;

		const lookupResultSave = {
			...lookupResult,
			userInfo,
			projectName: project.info.name
		};
		if (existingLookupResult) {
			// 更新
			await this.projectModel.updateOne(
				{ 'info.name': project.info.name, 'userInfo.userId': userInfo.userId },
				{
					$set: {
						lookupResult: lookupResultSave,
						status:
							existingProject.status === ProjectStatus.committed
								? ProjectStatus.lookuped
								: existingProject.status
					}
				}
			);
		} else {
			await this.projectModel.updateOne(
				{ 'info.name': project.info.name, 'userInfo.userId': userInfo.userId },
				{
					$set: {
						lookupResult: lookupResultSave,
						status: existingProject
							? existingProject.status === ProjectStatus.committed
								? ProjectStatus.lookuped
								: existingProject.status
							: ProjectStatus.lookuped
					}
				}
			);
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

		const lookupResult = await this.lookupProjectUnStream(existingProject, userInfo);

		return { ...existingProject, lookupResult } as ProjectVo;
	}

	/**
	 * 删除项目经验
	 */
	async deleteProject(
		id: string,
		userInfo: UserInfoFromToken
	): Promise<{ deleted: boolean; id?: string }> {
		const project = await this.projectModel
			.findOne({ _id: id, 'userInfo.userId': userInfo.userId })
			.exec();
		if (!project) {
			throw new Error(`Project with ID "${id}" not found or user unauthorized.`);
		}
		const result = await this.projectModel
			.deleteOne({ _id: id, 'userInfo.userId': userInfo.userId })
			.exec();
		if (result.deletedCount === 0) {
			throw new Error(`Project with ID "${id}" not found or user unauthorized.`);
		}
		// 删除相关的挖掘和打磨数据
		await this.projectPolishedModel.deleteMany({
			'info.name': project.info.name,
			'userInfo.userId': userInfo.userId
		});
		await this.projectMinedModel.deleteMany({
			'info.name': project.info.name,
			'userInfo.userId': userInfo.userId
		});

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

	/**
	 * 更新项目的分析结果
	 * @param id 项目ID
	 * @param lookupResult 分析结果
	 * @param userInfo 用户信息
	 */
	async updateLookupResult(id: string, lookupResult: any, userInfo: UserInfoFromToken) {
		const updatedProject = await this.projectModel
			.findOneAndUpdate(
				{ _id: id, 'userInfo.userId': userInfo.userId },
				{ $set: { lookupResult, status: ProjectStatus.lookuped } },
				{ new: true }
			)
			.exec();

		if (!updatedProject) {
			throw new Error(`Project with ID "${id}" not found or user unauthorized.`);
		}
		return updatedProject;
	}
}
