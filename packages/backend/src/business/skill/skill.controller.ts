import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserInfoFromToken } from '@prism-ai/shared';
import { RequireLogin, UserInfo } from '../../decorator';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillService } from './skill.service';

@Controller('skill')
// @UseGuards(RequireLogin) //! 傻逼幻觉害我d半天bug
export class SkillController {
	constructor(private readonly skillService: SkillService) {}

	@RequireLogin()
	@Post()
	create(@Body() createSkillDto: CreateSkillDto, @UserInfo() userInfo: UserInfoFromToken) {
		return this.skillService.create(createSkillDto, userInfo);
	}

	@RequireLogin()
	@Get(':id')
	findOne(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.skillService.findOne(id, userInfo);
	}

	@RequireLogin()
	@Get()
	findAll(@UserInfo() userInfo: UserInfoFromToken) {
		return this.skillService.findAll(userInfo);
	}

	@RequireLogin()
	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateSkillDto: UpdateSkillDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.skillService.update(id, updateSkillDto, userInfo);
	}

	@RequireLogin()
	@Delete(':id')
	remove(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.skillService.remove(id, userInfo);
	}
}
