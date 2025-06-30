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
import { UserInfoFromToken } from '@prism-ai/shared';
import { RequireLogin, UserInfo } from '../../decorator';
import { LLMSseService } from '../sse/llm-sse.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumeService } from './resume.service';

@Controller('resume')
export class ResumeController {
	constructor(
		private readonly resumeService: ResumeService,
		private readonly llmSseService: LLMSseService
	) {}

	@RequireLogin()
	@Sse('match')
	async resumeMatchJob(
		@Query('sessionId') sessionId: string,
		@Query('recover') recover: boolean,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		const metadata = {
			funcKey: this.resumeService.funcKeys.resumeMatchJob,
			poolName: this.resumeService.poolName
		};
		if (recover) {
			return this.llmSseService.handleSseRequestAndResponseRecover(sessionId, userInfo);
		}
		return this.llmSseService.handleSseRequestAndResponse(sessionId, userInfo, metadata);
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

	@RequireLogin()
	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body(new ValidationPipe()) updateResumeDto: UpdateResumeDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.resumeService.update(id, updateResumeDto, userInfo);
	}

	@RequireLogin()
	@Delete(':id')
	remove(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.resumeService.remove(id, userInfo);
	}
}
