import { Body, Controller, Get, Inject, Post, Put, Query } from '@nestjs/common';
import type { UserInfoFromToken, WebsiteStatus } from '@prisma-ai/shared';
import { RequireLogin, Role, UserInfo } from '../../decorator';
import { ManageNotifactionService } from './manage-notifaction.service';
import { ManageServiceService } from './manage-service.service';
import { ManageUserService } from './manage-user.service';

@Controller('manage')
export class ManageController {
	constructor(
		@Inject(ManageUserService)
		private readonly manageUserService: ManageUserService,
		@Inject(ManageServiceService)
		private readonly manageServiceService: ManageServiceService,
		@Inject(ManageNotifactionService)
		private readonly manageNotifactionService: ManageNotifactionService
	) {}

	// ================================ user ================================

	/**
	 * 获取用户列表
	 */
	@Get('users')
	@RequireLogin([Role.admin])
	async getUsers(@Query('page') page: string, @Query('limit') limit: string) {
		return this.manageUserService.getUsers(+page, +limit);
	}

	/**
	 * 封禁用户
	 */
	@Post('users/ban')
	@RequireLogin([Role.admin])
	async banUser(@Body('userId') userId: string, @Body('reason') reason?: string) {
		return this.manageUserService.banUser(+userId, reason);
	}

	/**
	 * 解封用户
	 */
	@Post('users/unban')
	@RequireLogin([Role.admin])
	async unbanUser(@Body('userId') userId: string) {
		return this.manageUserService.unbanUser(+userId);
	}

	/**
	 * 记录用户违规
	 */
	@Post('users/violation')
	@RequireLogin([Role.admin])
	async recordViolation(
		@Body('userId') userId: string,
		@Body('type') type: string,
		@Body('description') description?: string
	) {
		return this.manageUserService.recordViolation(+userId, type, description);
	}

	/**
	 * 获取用户违规列表
	 */
	@Get('users/violations')
	@RequireLogin([Role.admin])
	async getViolations(@Query('userId') userId: string) {
		return this.manageUserService.getViolations(+userId);
	}

	// ================================ service ================================

	/**
	 * 获取网站服务状态
	 */
	@Get('service/status')
	@RequireLogin([Role.admin])
	async getWebsiteStatus() {
		return this.manageServiceService.getWebsiteStatus();
	}

	/**
	 * 更新网站服务状态
	 */
	@Put('service/status')
	@RequireLogin([Role.admin])
	async updateWebsiteStatus(@Body('status') status: WebsiteStatus) {
		return this.manageServiceService.updateWebsiteStatus(status);
	}

	// ================================ notification ================================

	/**
	 * 创建通知
	 */
	@Post('notifications')
	@RequireLogin([Role.admin])
	async createNotification(
		@Body('title') title: string,
		@Body('content') content: string,
		@Body('target_user') target_user: string | null
	) {
		return this.manageNotifactionService.createNotification(
			title,
			content,
			target_user ? +target_user : null
		);
	}

	/**
	 * 获取通知列表（管理员视角）
	 */
	@Get('notifications')
	@RequireLogin([Role.admin])
	async getNotifications(@Query('page') page: string, @Query('limit') limit: string) {
		return this.manageNotifactionService.getNotifications(+page, +limit);
	}

	/**
	 * 获取用户通知列表
	 */
	@Get('user/notifications')
	@RequireLogin([Role.user, Role.admin])
	async getUserNotifications(
		@UserInfo() userInfo: UserInfoFromToken,
		@Query('page') page: string,
		@Query('limit') limit: string,
		@Query('is_read') is_read?: boolean
	) {
		return this.manageNotifactionService.getUserNotifications(
			+userInfo.userId,
			+page,
			+limit,
			is_read
		);
	}

	/**
	 * 将通知标记为已读
	 */
	@Post('user/notifications/read')
	@RequireLogin([Role.user, Role.admin])
	async markNotificationAsRead(
		@UserInfo() userInfo: UserInfoFromToken,
		@Body('notificationId') notificationId: string
	) {
		return this.manageNotifactionService.markNotificationAsRead(+userInfo.userId, +notificationId);
	}

	/**
	 * 将所有未读通知标记为已读
	 */
	@Post('user/notifications/read-all')
	@RequireLogin([Role.user, Role.admin])
	async markAllNotificationsAsRead(@UserInfo() userInfo: UserInfoFromToken) {
		return this.manageNotifactionService.markAllNotificationsAsRead(+userInfo.userId);
	}
}
