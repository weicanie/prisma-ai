import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserInfoFromToken } from '@prism-ai/shared';

import { PaginatedKnsResult, UpdateKnowledgeDto } from '@prism-ai/shared';
import { RequireLogin, UserInfo } from '../../decorator';
import { CreateKnowledgebaseDto } from './dto/create-knowledgebase.dto';
import { KnowledgebaseService } from './knowledge-base.service';

@Controller('knowledge-base')
export class KnowledgebaseController {
	constructor(private readonly knowledgebaseService: KnowledgebaseService) {}

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
	): Promise<PaginatedKnsResult> {
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
		@Body() updateKnowledgeDto: UpdateKnowledgeDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.knowledgebaseService.update(id, updateKnowledgeDto, userInfo);
	}

	@RequireLogin()
	@Delete(':id')
	remove(@Param('id') id: string, @UserInfo() userInfo: UserInfoFromToken) {
		return this.knowledgebaseService.remove(id, userInfo);
	}
}
