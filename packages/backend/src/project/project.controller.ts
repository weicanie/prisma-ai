import { Body, Controller, Post } from '@nestjs/common';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
	constructor(private readonly projectService: ProjectService) {}
	/**
	 * 用户上传初始项目经验。初始上传可以上传字符串（干脆都表单得了?）,但后续上传都通过表单。
	 * @description 1、信息不完整则要求用户补全
	 * @description 2、信息完整则进行后续处理
	 * @param project 项目经验
	 *
	 */
	@Post('raw')
	async uploadRaw(@Body() project: string) {
		return await this.projectService.transform(project);
	}
	/**
	 * 用户上传现有亮点评估、改进后的项目经验
	 * @description 1、ai评估、改进项目经验
	 * @description 2、用户进行diff、合并,然后上传进行下一步处理
	 * @param project 项目经验
	 *
	 */
	@Post('polished')
	async uploadPolished(@Body() project: string) {
		return await this.projectService.transform(project);
	}

	/**
	 * 用户上传亮点挖掘、生成后的项目经验
	 * @description 1、ai评估、改进项目经验
	 * @description 2、用户进行diff、合并,然后上传进行下一步处理
	 * @param project 项目经验
	 *
	 */
	@Post('mined')
	async uploadMined(@Body() project: string) {
		return await this.projectService.transform(project);
	}
}
