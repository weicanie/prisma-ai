import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { type UserInfoFromToken } from '@prisma-ai/shared';
import { UserInfo } from '../../decorator';
import { CareerService } from './career.service';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';

@ApiTags('career')
@Controller('career')
export class CareerController {
	constructor(private readonly careerService: CareerService) {}

	@Post()
	@ApiOperation({ summary: '创建工作经历' })
	create(@Body() createCareerDto: CreateCareerDto, @UserInfo() userInfo: UserInfoFromToken) {
		return this.careerService.create(createCareerDto, userInfo);
	}

	@Get()
	@ApiOperation({ summary: '查询工作经历列表' })
	findAll(@UserInfo() userInfo: UserInfoFromToken) {
		return this.careerService.findAll(userInfo.userId);
	}

	@Get(':id')
	@ApiOperation({ summary: '根据ID查询工作经历' })
	findOne(@Param('id') id: string) {
		return this.careerService.findOne(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: '更新工作经历' })
	update(
		@Param('id') id: string,
		@Body() updateCareerDto: UpdateCareerDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.careerService.update(id, updateCareerDto, userInfo);
	}

	@Delete(':id')
	@ApiOperation({ summary: '删除工作经历' })
	remove(@Param('id') id: string) {
		return this.careerService.remove(id);
	}
}
