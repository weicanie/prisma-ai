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
import { RequireLogin, UserInfo } from '../decorator';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumeService } from './resume.service';

@Controller('resume')
export class ResumeController {
	constructor(private readonly resumeService: ResumeService) {}

	@RequireLogin()
	@Post()
	create(
		@Body(new ValidationPipe()) createResumeDto: CreateResumeDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.resumeService.create(createResumeDto, userInfo);
	}

	@RequireLogin()
	@Get()
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
