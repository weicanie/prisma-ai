import { Body, Controller, Get, Patch } from '@nestjs/common';
import { userMemorySchema, type UserInfoFromToken, type UserMemoryT } from '@prisma-ai/shared';
import { RequireLogin, UserInfo } from '../../decorator';
import { UserMemoryService } from './user-memory.service';

@Controller('user-memory')
export class UserMemoryController {
	constructor(private readonly userMemoryService: UserMemoryService) {}

	/**
	 * 查询用户的用户记忆
	 */
	@Get()
	@RequireLogin()
	async getUserMemory(@UserInfo() userInfo: UserInfoFromToken) {
		return await this.userMemoryService.getUserMemory(userInfo.userId);
	}

	/**
	 * 更新用户的用户记忆
	 */
	@Patch()
	@RequireLogin()
	async updateUserMemory(
		@UserInfo() userInfo: UserInfoFromToken,
		@Body() userMemoryData: UserMemoryT
	) {
		//验证数据格式
		const validatedData = userMemorySchema.safeParse(userMemoryData);
		if (!validatedData.success) {
			throw new Error('用户记忆数据格式错误');
		}
		return await this.userMemoryService.updateUserMemory(userInfo.userId, validatedData.data);
	}
}
