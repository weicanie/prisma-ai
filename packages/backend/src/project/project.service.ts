import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type UserInfoFromToken, projectMinedSchema, projectSchema } from '@prism-ai/shared';
import { type Model } from 'mongoose';
import { ChainService } from '../chain/chain.service';
import { type ProjectDto } from './dto/project.dto';
import { type projectMinedDto } from './dto/projectMined.dto';
import { type projectPolishedtDto } from './dto/projectPolished.dto';
import { Project } from './entities/project.entity';
import { ProjectMined } from './entities/projectMined.entity';
import { ProjectPolished } from './entities/projectPolished.entity';

export enum ProjectState {
	uninit = 'uninit', //信息未完整
	committed = 'committed', //已接受（信息完整）
	polished = 'polished', //已打磨
	mined = 'mined', //已挖掘
	accepted = 'accepted' //已接受
}
type ExpandEnumValues<T> = T[keyof T];

@Injectable()
export class ProjectService {
	@InjectModel(Project.name)
	private projectModel: Model<Project>;

	@InjectModel(ProjectPolished.name)
	private ProjectPolishedModel: Model<ProjectPolished>;

	@InjectModel(ProjectMined.name)
	private ProjectMinedModel: Model<ProjectMined>;

	constructor(public chainService: ChainService) {}

	async callGraph() {}
	async responseToUserAndWait() {}

	/**
	 * 项目描述转换为json格式的对象并检查
	 * @param project
	 * @returns
	 */
	async transformAndCheckProject(projectText: string, userInfo: UserInfoFromToken) {
		const chain = await this.chainService.tansformChain();
		const project_json_obj = await chain.invoke(projectText);
		const checker = this.getChecker(project_json_obj, projectSchema, this.projectModel, userInfo);
		return await checker();
	}

	async checkProject(project: ProjectDto, userInfo: UserInfoFromToken) {
		const checker = this.getChecker(project, projectSchema, this.projectModel, userInfo);
		return await checker();
	}

	async checkProjectPolished(project: projectPolishedtDto, userInfo: UserInfoFromToken) {
		const checker = this.getChecker(
			project,
			projectMinedSchema,
			this.ProjectPolishedModel,
			userInfo
		);
		return await checker();
	}

	async checkProjectMined(project: projectMinedDto, userInfo: UserInfoFromToken) {
		const checker = this.getChecker(project, projectMinedSchema, this.ProjectMinedModel, userInfo);
		return await checker();
	}

	/**
	 * 项目信息检查后储存或者让用户补全。
	 * @description -> 信息完整
	 */
	getChecker(project: any, zodSchema: any, model: any, userInfo: UserInfoFromToken) {
		return async function check() {
			try {
				zodSchema.parse(project);
			} catch (error) {
				const projectSave = { ...project, status: ProjectState.uninit, userId: userInfo.userId };
				const project_model = new model(projectSave);
				await project_model.save();
				return '项目描述不完整，请补全';
			}
			//作为state传递,抽离
			//增, 加上用户信息、进度(init、committed、polished、mined、accepted)以查询
			const projectSave = { ...project, status: ProjectState.committed, userId: userInfo.userId };
			const project_model = new model(projectSave);

			return await project_model.save();
		};
	}
	/**
	 * mcp tool 查询数据库
	 * @param query 查询语句
	 * @returns 查询结果
	 */
	async query(query: string) {
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
