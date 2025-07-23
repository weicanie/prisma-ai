import { Controller, Get, Logger, Query } from '@nestjs/common';
import { UserInfoFromToken } from '@prisma-ai/shared';
import { RequireLogin, UserInfo } from '../decorator';
import { OssService } from './oss.service';
@Controller('oss')
export class OssController {
	private logger = new Logger();

	constructor(private ossService: OssService) {}

	/**
	 * 返回预签名URL给前端以直传文件到oss
	 * @param name 对象名(文件名)
	 * @param bucketName 桶名
	 * @returns 预签名URL
	 */
	@RequireLogin()
	@Get('presignedUrl')
	async presignedPutObject(
		@Query('name') name: string,
		@Query('bucketName') bucketName = 'prisma-ai',
		@UserInfo() userInfo: UserInfoFromToken
	) {
		try {
			return await this.ossService.presignedPutObject(userInfo.userId, name, bucketName);
		} catch (error) {
			this.logger.error(error, 'OssController ~ presignedPutObject');
		}
	}
}
