import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserInfoFromToken } from '@prism-ai/shared'; // Assuming this type is available
import { RequireLogin, UserInfo } from '../../decorator'; // Assuming these decorators are available
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillService } from './skill.service';

@Controller('skill')
@UseGuards(RequireLogin) // Apply to all routes in this controller
export class SkillController {
	constructor(private readonly skillService: SkillService) {}

	@Post()
	create(@Body() createSkillDto: CreateSkillDto, @UserInfo() userInfo: UserInfoFromToken) {
		return this.skillService.create(createSkillDto, userInfo);
	}

	@Get(':id')
	findOne(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.skillService.findOne(id, userInfo);
	}

	@Get()
	findAll(@UserInfo() userInfo: UserInfoFromToken) {
		return this.skillService.findAll(userInfo);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateSkillDto: UpdateSkillDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.skillService.update(id, updateSkillDto, userInfo);
	}

	@Delete(':id')
	remove(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.skillService.remove(id, userInfo);
	}
}
