import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
	ValidationPipe
} from '@nestjs/common';
import { UserInfoFromToken } from '@prism-ai/shared';
import { RequireLogin, UserInfo } from '../../decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobService } from './job.service';

@Controller('job')
export class JobController {
	constructor(private readonly jobService: JobService) {}

	@UseGuards(RequireLogin)
	@Post()
	create(
		@Body(new ValidationPipe()) createJobDto: CreateJobDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.jobService.create(createJobDto, userInfo);
	}

	@UseGuards(RequireLogin)
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

	@UseGuards(RequireLogin)
	@Get('one/:id')
	findOneUserJob(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.jobService.findOne(id, userInfo);
	}

	@UseGuards(RequireLogin)
	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body(new ValidationPipe()) updateJobDto: UpdateJobDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.jobService.update(id, updateJobDto, userInfo);
	}

	@UseGuards(RequireLogin)
	@Delete(':id')
	remove(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.jobService.remove(id, userInfo);
	}
}
