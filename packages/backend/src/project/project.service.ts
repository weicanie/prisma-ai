import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChainService } from '../chain/chain.service';
import { ProjectExperience, projectSchema } from '../types/project.schema';
import { Project } from './entities/project.entities';

@Injectable()
export class ProjectService {
	@InjectModel(Project.name)
	private projectModel: Model<Project>;
	constructor(public chainService: ChainService) {}
	async callGraph() {}

	async responseToUserAndWait() {}
	/**
	 * 项目描述转换为json
	 * @param project
	 * @returns
	 */
	async transform(project: string) {
		const chain = await this.chainService.tansformChain();
		const project_json_obj = await chain.invoke(project);
		//作为state传递,抽离
		//增, 加上用户信息、进度(init、committed、polished、mined、accepted)以查询
		const project_model = new this.projectModel(project_json_obj);
		return await project_model.save();
	}

	/**
	 * 项目信息检查和让用户补全。
	 * @description -> 信息完整
	 */
	async check(project: ProjectExperience) {
		try {
			projectSchema.parse(project);
		} catch (error) {
			return {
				code: 0,
				message: '项目描述不完整，请补全',
				data: project
			};
		}
		return project;
	}
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
