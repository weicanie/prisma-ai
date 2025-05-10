import { Body, Controller, Post } from '@nestjs/common';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
	constructor(private readonly projectService: ProjectService) {}

	@Post('transform')
	async transform(@Body() project: string) {
		return await this.projectService.transform(project);
	}
}
