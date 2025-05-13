import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChainService } from '../chain/chain.service';
import { ProjectExperience } from '../types/project';
import { Project } from './entities/project.entities';

@Injectable()
export class ProjectService {
	@InjectModel(Project.name)
	private projectModel: Model<Project>;
	constructor(public chainService: ChainService) {}
	// TODO next: 注册、登录功能（复用data-fetch）
	/**
	 * 项目描述转换为json
	 * @param project
	 * @returns
	 */
	async transform(project: string) {
		const chain = await this.chainService.tansformChain();
		const project_json_obj = await chain.invoke(project);
		//增
		const project_model = new this.projectModel(project_json_obj);
		//加上用户信息以查询
		return await project_model.save();
	}

	/**
	 * 项目信息检查和让用户补全。
	 * @description -> 信息完整
	 */
	async infoCheck(project: ProjectExperience) {}
}
