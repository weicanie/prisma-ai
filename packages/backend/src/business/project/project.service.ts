import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	ErrorCode,
	lookupResultSchema,
	projectMinedSchema,
	projectPolishedSchema,
	projectSchema,
	ProjectStatus,
	ProjectVo,
	UserInfoFromToken
} from '@prism-ai/shared';
import { Model } from 'mongoose';
import { ZodError } from 'zod';
import { ChainService } from '../../chain/chain.service';
import { ProjectDto } from './dto/project.dto';
import { LookupResult, LookupResultDocument } from './entities/lookupResult.entity';
import { Project, ProjectDocument } from './entities/project.entity';
import { ProjectMined, ProjectMinedDocument } from './entities/projectMined.entity';
import { ProjectPolished, ProjectPolishedDocument } from './entities/projectPolished.entity';
/* 
用户id 项目名称 -> 不同状态的项目经验
*/
@Injectable()
export class ProjectService {
	@InjectModel(Project.name)
	private projectModel: Model<ProjectDocument>;

	@InjectModel(ProjectPolished.name)
	private ProjectPolishedModel: Model<ProjectPolishedDocument>;

	@InjectModel(ProjectMined.name)
	private ProjectMinedModel: Model<ProjectMinedDocument>;

	@InjectModel(LookupResult.name)
	private LookupResultModel: Model<LookupResultDocument>;

	constructor(public chainService: ChainService) {}

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
			const dataToSave = { ...data, status: ProjectStatus.refuse, userInfo };
			await new model(dataToSave).save();

			if (error instanceof ZodError) {
				const errorMessage = JSON.stringify(error.format());
				throw new Error(ErrorCode.FORMAT_ERROR + `${errorMessage}`);
			}
			console.error('zod schema验证失败:', error);
			throw error;
		}

		const dataToSave = { ...project, status: ProjectStatus.committed, userInfo };
		const newModel = new model(dataToSave);
		await newModel.save();
		this.lookupProject(project, userInfo);
		return { ...newModel.toObject(), lookupResult: {} } as Omit<ProjectVo, 'lookupResult'>;
	}

	/**
	 * 分析项目经验存在的问题和解决方案
	 */
	async lookupProject(project: ProjectDto, userInfo: UserInfoFromToken) {
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
		//储存
		const lookupResultSave = { ...lookupResult, userInfo, projectName: project.info.name };
		const lookupResult_model = new this.LookupResultModel(lookupResultSave);
		await lookupResult_model.save();
		return lookupResult_model;
	}
	/**
	 * 项目经验 -> 打磨后的项目经验
	 * @param project 项目经验
	 */
	async polishProject(project: ProjectDto, userInfo: UserInfoFromToken) {
		const chain = await this.chainService.polishChain();
		const projectStr = JSON.stringify(project);
		let projectPolished = await chain.invoke(projectStr);
		//格式验证
		const validationResult = projectPolishedSchema.safeParse(projectPolished);

		if (!validationResult.success) {
			const errorMessage = JSON.stringify(validationResult.error.format());
			const fomartFixChain = await this.chainService.fomartFixChain(
				projectPolishedSchema,
				errorMessage
			);
			const projectPolishedStr = JSON.stringify(projectPolished);
			projectPolished = await fomartFixChain.invoke({ input: projectPolishedStr });
		}
		//储存
		const projectPolishedSave = { ...projectPolished, status: ProjectStatus.polishing, userInfo };
		const projectPolished_model = new this.ProjectPolishedModel(projectPolishedSave);

		await projectPolished_model.save();
		return projectPolished_model;
	}
	/**
	 * 项目经验 -> 挖掘后的项目经验
	 * @param project 项目经验
	 */
	/**
	 * 项目经验 -> 挖掘后的项目经验
	 * @param project 项目经验
	 */
	async mineProject(project: ProjectDto, userInfo: UserInfoFromToken) {
		const chain = await this.chainService.mineChain();
		const projectStr = JSON.stringify(project);
		let projectMined = await chain.invoke(projectStr);

		// 格式验证
		const validationResult = projectMinedSchema.safeParse(projectMined);

		if (!validationResult.success) {
			const errorMessage = JSON.stringify(validationResult.error.format());
			const fomartFixChain = await this.chainService.fomartFixChain(
				projectMinedSchema,
				errorMessage
			);
			const projectMinedStr = JSON.stringify(projectMined);
			projectMined = await fomartFixChain.invoke({ input: projectMinedStr });
		}

		const projectMinedSave = { ...projectMined, status: ProjectStatus.mining, userInfo };
		const projectMined_model = new this.ProjectMinedModel(projectMinedSave);

		await projectMined_model.save();
	}

	async findAllProjects(userInfo: UserInfoFromToken): Promise<ProjectVo[]> {
		//并行查询
		const projects = await this.projectModel.find({ 'userInfo.userId': userInfo.userId }).exec();
		if (!projects || projects.length === 0) {
			return [];
		}
		const promises = projects.map(project => {
			return this.LookupResultModel.findOne({
				'userInfo.userId': userInfo.userId,
				projectName: project.info.name
			}).exec();
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
	 * 获取指定状态的项目经验
	 * @param status 项目状态
	 * @param name 项目名称 (可选)
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
		//ProjectPolishedModel里只有状态为polishing的项目
		//ProjectMinedModel里只有状态为mining的项目
		const promises = [
			this.ProjectMinedModel.findOne(query).exec(),
			this.ProjectPolishedModel.findOne(query).exec(),
			this.projectModel.findOne(query).exec()
		];

		const results = await Promise.allSettled(promises);
		const project = results.find(result => result.status === 'fulfilled' && result.value !== null);
		if (!project) {
			throw new Error(`名为${name}状态为${status}的项目经验不存在`);
		} else if (project.status === 'fulfilled') {
			const lookupResult = await this.LookupResultModel.findOne({
				'userInfo.userId': userInfo.userId,
				projectName: project.value!.info.name
			}).exec();
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
	 * 更新项目经验
	 */
	async updateProject(
		id: string,
		projectDto: Partial<ProjectDto>,
		userInfo: UserInfoFromToken
	): Promise<ProjectVo> {
		const existingProject = await this.projectModel
			.findOneAndUpdate(
				{ _id: id, 'userInfo.userId': userInfo.userId },
				{ $set: projectDto },
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
		await this.lookupProject(projectToLookup as ProjectDto, userInfo);
		const lookupResult = await this.LookupResultModel.findOne({
			'userInfo.userId': userInfo.userId,
			projectName: existingProject.info.name
		}).exec();
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
