import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
	type CreateProjectDeepWikiKnowledgeDto,
	type DeepWikiKnowledgeDto,
	type UserInfoFromToken
} from '@prisma-ai/shared';

import { type PaginatedProjectKnsResult, type UpdateProjectKnowledgeDto } from '@prisma-ai/shared';
import crypto from 'crypto';
import { RequireLogin, UserInfo } from '../../decorator';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { CreateKnowledgebaseDto } from './dto/create-knowledgebase.dto';
import { KnowledgebaseService } from './knowledge-base.service';
import { ProjectDeepWikiService } from './project-deepwiki.service';

@Controller('knowledge-base')
export class KnowledgebaseController {
	constructor(
		private readonly knowledgebaseService: KnowledgebaseService,
		private readonly projectDeepWikiService: ProjectDeepWikiService,
		private readonly taskQueueService: TaskQueueService
	) {}

	@RequireLogin()
	@Post()
	create(
		@Body() createKnowledgeDto: CreateKnowledgebaseDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.knowledgebaseService.create(createKnowledgeDto, userInfo);
	}

	@RequireLogin()
	@Get()
	findAll(
		@UserInfo() userInfo: UserInfoFromToken,
		@Query('page') page?: string,
		@Query('limit') limit?: string
	): Promise<PaginatedProjectKnsResult> {
		// Added return type
		const pageNumber = page ? parseInt(page, 10) : 1;
		const limitNumber = limit ? parseInt(limit, 10) : 10;
		return this.knowledgebaseService.findAll(userInfo, pageNumber, limitNumber);
	}

	@RequireLogin()
	@Get(':id')
	findOne(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.knowledgebaseService.findOne(id, userInfo);
	}

	@RequireLogin()
	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateKnowledgeDto: UpdateProjectKnowledgeDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.knowledgebaseService.update(id, updateKnowledgeDto, userInfo);
	}

	@RequireLogin()
	@Delete(':id')
	remove(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.knowledgebaseService.remove(id, userInfo);
	}

	@RequireLogin()
	@Post('download-deepwiki')
	async downloadDeepWiki(
		@Body() dto: DeepWikiKnowledgeDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		const sessionId = crypto.randomUUID();
		const task = await this.taskQueueService.createAndEnqueueTask(
			sessionId,
			userInfo.userId.toString(),
			'downloadDeepWiki',
			{ param: { dto }, progress: { done: false } }
		);
		return task;
	}

	@RequireLogin()
	@Post('upload-deepwiki')
	async uploadDeepWiki(
		@Body() dto: CreateProjectDeepWikiKnowledgeDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		const sessionId = crypto.randomUUID();
		const task = await this.taskQueueService.createAndEnqueueTask(
			sessionId,
			userInfo.userId.toString(),
			'uploadDeepWikiToKnowledgeBase',
			{ param: { dto, userInfo }, progress: { done: false } }
		);
		return task;
	}

	@RequireLogin()
	@Get('task/:taskId')
	async getTaskResult(@Param('taskId') taskId: string) {
		const task = await this.taskQueueService.getTask(taskId);
		return { task };
	}
}
