import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	ValidationPipe
} from '@nestjs/common';
import { UserInfoFromToken } from '@prism-ai/shared';
import { RequireLogin, UserInfo } from '../../decorator';
import { CrawlJobService } from './crawl-job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { StartCrawlDto } from './dto/start-crawl.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobService } from './job.service';

@Controller('job')
export class JobController {
	constructor(
		private readonly jobService: JobService,
		private readonly crawlJobService: CrawlJobService,
	) {}

	@RequireLogin()
	@Post('crawl')
	startCrawl(@Body(new ValidationPipe()) startCrawlDto: StartCrawlDto) {
		return this.crawlJobService.startCrawlTask(startCrawlDto);
	}

	@RequireLogin()
	@Post()
	create(
		@Body(new ValidationPipe()) createJobDto: CreateJobDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.jobService.create(createJobDto, userInfo);
	}

	@RequireLogin()
	@Get('all')
	findAllUserJobs(
		@UserInfo() userInfo: UserInfoFromToken,
		@Query('page') page?: string,
		@Query('limit') limit?: string
	) {
		const pageNumber = page ? parseInt(page, 10) : 1;
		const limitNumber = limit ? parseInt(limit, 10) : 10;
		return this.jobService.findAll(userInfo, pageNumber, limitNumber);
	}

	@RequireLogin()
	@Get('become/:jobId')
	becomeUserJob(@Param('jobId') jobId: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.jobService.becomeUserJob(jobId, userInfo);
	}

	@RequireLogin()
	@Get('one/:id')
	findOneUserJob(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.jobService.findOne(id, userInfo);
	}

	/**
	 * 根据简历ID查询所有匹配的岗位
	 * @param resumeId 简历ID
	 * @param userInfo 用户信息
	 * @returns 匹配的岗位列表
	 */
	@RequireLogin()
	@Get('matched/:resumeId')
	findAllMatched(@Param('resumeId') resumeId: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.jobService.findAllMatched(resumeId, userInfo);
	}

	@RequireLogin()
	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body(new ValidationPipe()) updateJobDto: UpdateJobDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.jobService.update(id, updateJobDto, userInfo);
	}

	@RequireLogin()
	@Delete(':id')
	remove(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.jobService.remove(id, userInfo);
	}
}
