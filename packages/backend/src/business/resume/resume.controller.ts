import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Sse,
	ValidationPipe
} from '@nestjs/common';
import {
	SelectedLLM,
	type UpdateResumeContentDto,
	type UserInfoFromToken
} from '@prisma-ai/shared';
import { RequireLogin, UserInfo } from '../../decorator';
import { SseManagerService } from '../../manager/sse-session-manager/sse-manager.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ResumeRepoDto } from './dto/resumeRepo.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumeJsonService } from './resume-repo.service';
import { ResumeService } from './resume.service';

@Controller('resume')
export class ResumeController {
	constructor(
		private readonly resumeService: ResumeService,
		private readonly sseManagerService: SseManagerService,
		private readonly resumeJsonService: ResumeJsonService
	) {}

	@RequireLogin()
	@Sse('match')
	async resumeMatchJob(
		@Query('sessionId') sessionId: string,
		@Query('recover') recover: boolean,
		@Query('model') model: SelectedLLM,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		const metadata = {
			funcKey: this.resumeService.funcKeys.resumeMatchJob,
			poolName: this.resumeService.poolName,
			model
		};
		if (recover) {
			return this.sseManagerService.handleSseRequestAndResponseRecover(sessionId, userInfo);
		}
		return this.sseManagerService.handleSseRequestAndResponse(sessionId, userInfo, metadata);
	}

	@RequireLogin()
	@Post()
	create(
		@Body(new ValidationPipe()) createResumeDto: CreateResumeDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.resumeService.create(createResumeDto, userInfo);
	}

	@RequireLogin()
	@Get('all')
	findAll(
		@UserInfo() userInfo: UserInfoFromToken,
		@Query('page') page?: string,
		@Query('limit') limit?: string
	) {
		const pageNumber = page ? parseInt(page, 10) : 1;
		const limitNumber = limit ? parseInt(limit, 10) : 10;
		return this.resumeService.findAll(userInfo, pageNumber, limitNumber);
	}

	@RequireLogin()
	@Get(':id')
	findOne(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.resumeService.findOne(id, userInfo);
	}

	@RequireLogin()
	@Get('matched/one/:jobId')
	findResumeMatchedByJobId(@Param('jobId') jobId: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.resumeService.findResumeMatchedByJobId(jobId);
	}

	@RequireLogin()
	@Get('matched/all')
	findAllResumeMatched(
		@UserInfo() userInfo: UserInfoFromToken,
		@Query('page') page?: string,
		@Query('limit') limit?: string
	) {
		const pageNumber = page ? parseInt(page, 10) : 1;
		const limitNumber = limit ? parseInt(limit, 10) : 10;
		return this.resumeService.findAllResumeMatched(userInfo, pageNumber, limitNumber);
	}

	/**
	 * 更新简历及其关联的文档id(技能、项目、教育经历、职业经历)
	 */
	@RequireLogin()
	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body(new ValidationPipe()) updateResumeDto: UpdateResumeDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.resumeService.update(id, updateResumeDto, userInfo);
	}

	/**
	 * 更新简历及其关联的文档内容(技能、项目、教育经历、职业经历)
	 */
	@RequireLogin()
	@Patch('content/:id')
	updateFromContent(
		@Param('id') id: string,
		@Body() updateResumeDto: UpdateResumeContentDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.resumeService.updateFromContent(id, updateResumeDto, userInfo);
	}

	@RequireLogin()
	@Delete(':id')
	remove(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.resumeService.remove(id, userInfo);
	}

	@RequireLogin()
	@Delete('matched/:id')
	removeResumeMatched(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.resumeService.removeResumeMatched(id, userInfo);
	}

	@RequireLogin()
	@Get('export/:id')
	exportResume(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.resumeJsonService.exportResume(id, userInfo);
	}

	@RequireLogin()
	@Post('repo')
	resumeRepositoryManager(@Body() repoDto: ResumeRepoDto, @UserInfo() userInfo: UserInfoFromToken) {
		return this.resumeJsonService.handleRepoAction(repoDto);
	}
}
