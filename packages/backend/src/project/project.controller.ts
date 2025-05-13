import { Body, Controller, Post } from '@nestjs/common';
import { ProjectDto } from './dto/project.dto';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
	constructor(private readonly projectService: ProjectService) {}
	/**
	 * 用户以文本上传初始项目经验。后续上传都通过表单。
	 * @description 1、信息不完整则要求用户补全
	 * @param project 项目经验
	 *
	 */
	@Post('rawtext')
	async uploadRawText(@Body() projectText: string) {
		return await this.projectService.transform(projectText);
	}
	/**
	 * 用户通过表单上传初始项目经验。
	 * @param project 项目经验
	 *
	 */
	@Post('raw')
	async uploadRaw(@Body() project: ProjectDto) {}
	/**
	 * 用户上传 合并polished后的项目经验
	 * @description 1、ai评估、改进项目经验
	 * @description 2、用户进行diff、合并,然后上传进行下一步处理
	 * @param project 项目经验
	 *
	 */
	@Post('polished')
	async uploadPolished(@Body() project: ProjectDto) {}

	/**
	 * 用户上传 合并mined后的项目经验
	 * @description 1、ai进行亮点挖掘、生成
	 * @description 2、用户进行diff、合并,然后上传进行下一步处理
	 * @param project 项目经验
	 *
	 */
	@Post('mined')
	async uploadMined(@Body() project: ProjectDto) {}
}
