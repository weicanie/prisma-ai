import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChainService } from '../chain/chain.service';
import { Project } from './entities/project.entities';

@Injectable()
export class ProjectService {
	@InjectModel(Project.name)
	private projectModel: Model<Project>;
	constructor(public chainService: ChainService) {}

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
		return await project_model.save();
	}

	/**
	 * 信息检查和补全
	 * @returns
	 */
	async infoCompletion() {}
}
