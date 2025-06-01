import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ProjectStatus, UserInfoFromToken } from '@prism-ai/shared';
import { RequireLogin, UserInfo } from '../../decorator';
import { ProjectDto } from './dto/project.dto';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
	constructor(private readonly projectService: ProjectService) {}

	/**
	 * 用户上传指定格式的项目经验
	 * @param project 项目经验
	 *
	 */
	@RequireLogin()
	@Post('raw')
	async createProject(@Body() project: ProjectDto, @UserInfo() userInfo: UserInfoFromToken) {
		return await this.projectService.checkoutProject(project, userInfo);
	}

	/**
	 * 用户上传已有的项目经验文本,  使用llm改写格式。
	 * @param project 项目经验
	 *
	 */
	@RequireLogin()
	@Post('text')
	async createFrommRawText(@Body() projectText: string, @UserInfo() userInfo: UserInfoFromToken) {
		return await this.projectService.transformAndCheckProject(projectText, userInfo);
	}

	/**
	 * 获取用户的所有项目经验
	 */
	@RequireLogin()
	@Get('all')
	async findAllProjects(@UserInfo() userInfo: UserInfoFromToken) {
		const projects = await this.projectService.findAllProjects(userInfo);
		return projects;
	}

	/**
	 * 获取指定状态的项目经验
	 */
	@RequireLogin()
	@Get('one')
	async findByNameAndStatus(
		@Query('name') name: string,
		@Query('status') status: `${ProjectStatus}`,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		const project = await this.projectService.findByNameAndStatus(name, status, userInfo);
		return project;
	}

	@RequireLogin()
	@Put(':id')
	async updateProject(
		@Param('id') id: string,
		@Body() projectUpdateDto: Partial<ProjectDto>,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		const updatedProject = await this.projectService.updateProject(id, projectUpdateDto, userInfo);
		return updatedProject;
	}

	@RequireLogin()
	@Delete(':id')
	async deleteProject(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return await this.projectService.deleteProject(id, userInfo);
	}

	/* mcp tools 测试 */
	/* 	@Post('tool-query')
	async toolQuery(@Body() query: string) {
		return await this.projectService.toolQuery(query);
	} */
}
