import { Body, Controller, Delete, Get, Param, Post, Put, Query, Sse } from '@nestjs/common';
import {
	type ImplementDto,
	ProjectStatus,
	type SelectedLLM,
	type UserInfoFromToken
} from '@prisma-ai/shared';
import * as crypto from 'crypto';
import { RequireLogin, UserInfo } from '../../decorator';
import { SseManagerService } from '../../manager/sse-session-manager/sse-manager.service';
import { ProjectDto } from './dto/project.dto';
import { ProjectImplementService } from './project-implement.service';
import { ProjectProcessService } from './project-process.service';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
	constructor(
		private readonly projectService: ProjectService,
		private readonly projectImplementService: ProjectImplementService,
		private readonly projectProcessService: ProjectProcessService,
		private readonly sseManagerService: SseManagerService
	) {}

	/**
	 * 分析项目经验 - 使用AI对项目经验进行分析和总结
	 * @param sessionId 会话id
	 * @param recover 是否恢复
	 * @param userInfo 用户信息
	 * @returns 返回分析结果
	 */
	@RequireLogin()
	@Sse('lookup')
	async lookupProject(
		@Query('sessionId') sessionId: string,
		@Query('recover') recover: boolean,
		@Query('model') model: SelectedLLM,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		const metadata = {
			funcKey: this.projectProcessService.funcKeys.lookupProject,
			poolName: this.projectProcessService.poolName,
			model: model
		};
		if (recover) {
			return this.sseManagerService.handleSseRequestAndResponseRecover(sessionId, userInfo);
		}
		return this.sseManagerService.handleSseRequestAndResponse(sessionId, userInfo, metadata);
	}

	/**
	 * 打磨项目经验 - 使用AI对项目经验进行优化和改进
	 * @param project 原始项目经验数据
	 * @param userInfo 用户信息
	 * @returns 返回打磨后的项目经验
	 */
	@RequireLogin()
	@Sse('polish')
	async polishProject(
		@Query('sessionId') sessionId: string,
		@Query('recover') recover: boolean,
		@Query('model') model: SelectedLLM,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		const metadata = {
			funcKey: this.projectProcessService.funcKeys.polishProject,
			poolName: this.projectProcessService.poolName,
			model: model
		};
		if (recover) {
			return this.sseManagerService.handleSseRequestAndResponseRecover(sessionId, userInfo);
		}
		return this.sseManagerService.handleSseRequestAndResponse(sessionId, userInfo, metadata);
	}

	/**
	 * 挖掘项目经验 - 使用AI深度挖掘项目经验中的亮点和价值
	 * @param project 原始项目经验数据
	 * @param userInfo 用户信息
	 * @returns 返回挖掘后的项目经验
	 */
	@RequireLogin()
	@Sse('mine')
	async mineProject(
		@Query('sessionId') sessionId: string,
		@Query('recover') recover: boolean,
		@Query('model') model: SelectedLLM,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		const metadata = {
			funcKey: this.projectProcessService.funcKeys.mineProject,
			poolName: this.projectProcessService.poolName,
			model: model
		};
		if (recover) {
			return this.sseManagerService.handleSseRequestAndResponseRecover(sessionId, userInfo);
		}
		return this.sseManagerService.handleSseRequestAndResponse(sessionId, userInfo, metadata);
	}

	/**
	 * 分析项目业务的领域信息与战略设计
	 * @param project 原始项目经验数据
	 * @param userInfo 用户信息
	 * @returns 返回生成后的项目经验
	 */
	@RequireLogin()
	@Sse('business-lookup')
	async businessLookupProject(
		@Query('sessionId') sessionId: string,
		@Query('recover') recover: boolean,
		@Query('model') model: SelectedLLM,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		const metadata = {
			funcKey: this.projectProcessService.funcKeys.businessLookupProject,
			poolName: this.projectProcessService.poolName,
			model: model
		};
		if (recover) {
			return this.sseManagerService.handleSseRequestAndResponseRecover(sessionId, userInfo);
		}
		return this.sseManagerService.handleSseRequestAndResponse(sessionId, userInfo, metadata);
	}

	/**
	 * 生成项目业务的面试用材料
	 * @param project 原始项目经验数据
	 * @param userInfo 用户信息
	 * @returns 返回生成后的项目经验
	 */
	@RequireLogin()
	@Sse('business-paper')
	async businessPaperProject(
		@Query('sessionId') sessionId: string,
		@Query('recover') recover: boolean,
		@Query('model') model: SelectedLLM,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		const metadata = {
			funcKey: this.projectProcessService.funcKeys.businessPaperProject,
			poolName: this.projectProcessService.poolName,
			model: model
		};
		if (recover) {
			return this.sseManagerService.handleSseRequestAndResponseRecover(sessionId, userInfo);
		}
		return this.sseManagerService.handleSseRequestAndResponse(sessionId, userInfo, metadata);
	}

	/**
	 * 使用Agent实现亮点
	 * @param implementDto 实现亮点所需的数据
	 * @param userInfo 用户信息
	 */
	@RequireLogin()
	@Post('agent-implement')
	async implement(@Body() implementDto: ImplementDto, @UserInfo() userInfo: UserInfoFromToken) {
		try {
			const project = await this.projectService.findProjectById(implementDto.projectId, userInfo);
			return {
				data: await this.projectImplementService.startLightspotImplementTask(
					project,
					implementDto.lightspot,
					implementDto.projectPath,
					userInfo,
					crypto.randomUUID()
				),
				message: '请到 CLI 与Agent协作'
			};
		} catch (error) {
			throw error;
		}
	}

	/* mcp tools 测试 */
	@Post('tool-query')
	async toolQuery(@Body() query: string) {
		return await this.projectService.toolQuery(query);
	}

	/**
	 * 用户上传指定格式的项目经验
	 * @param project 项目经验
	 *
	 */
	@RequireLogin()
	@Post('add')
	async createProject(@Body() project: ProjectDto, @UserInfo() userInfo: UserInfoFromToken) {
		return await this.projectProcessService.checkoutProject(project, userInfo);
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
	 * 根据id获取项目经验
	 */
	@RequireLogin()
	@Get(':id')
	async findProjectById(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		const project = await this.projectService.findProjectById(id, userInfo);
		return project;
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
}
