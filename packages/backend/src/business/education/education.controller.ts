import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { type UserInfoFromToken } from '@prisma-ai/shared';
import { UserInfo } from '../../decorator';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { EducationService } from './education.service';

@ApiTags('education')
@Controller('education')
export class EducationController {
	constructor(private readonly educationService: EducationService) {}

	@Post()
	@ApiOperation({ summary: '创建教育经历' })
	create(@Body() createEducationDto: CreateEducationDto, @UserInfo() userInfo: UserInfoFromToken) {
		return this.educationService.create(createEducationDto, userInfo);
	}

	@Get()
	@ApiOperation({ summary: '查询教育经历列表' })
	findAll(@UserInfo() userInfo: UserInfoFromToken) {
		return this.educationService.findAll(userInfo.userId);
	}

	@Get(':id')
	@ApiOperation({ summary: '根据ID查询教育经历' })
	findOne(@Param('id') id: string) {
		return this.educationService.findOne(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: '更新教育经历' })
	update(
		@Param('id') id: string,
		@Body() updateEducationDto: UpdateEducationDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.educationService.update(id, updateEducationDto, userInfo);
	}

	@Delete(':id')
	@ApiOperation({ summary: '删除教育经历' })
	remove(@Param('id') id: string) {
		return this.educationService.remove(id);
	}
}
