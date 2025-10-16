import { Inject, Injectable } from '@nestjs/common';
import { DbService } from '../../DB/db.service';

/**
 * 网站通知管理。
 */
@Injectable()
export class ManageNotifactionService {
	constructor(
		@Inject(DbService)
		private readonly dbService: DbService
	) {}

	/**
	 * 创建通知
	 * @param title 标题
	 * @param content 内容
	 * @param target_user 目标用户ID，null表示全体用户
	 */
	async createNotification(title: string, content: string, target_user: number | null) {
		return this.dbService.notification.create({
			data: { title, content, target_user }
		});
	}

	/**
	 * 获取通知列表（管理员视角）
	 * @param page 页码
	 * @param limit 每页数量
	 */
	async getNotifications(page: number, limit: number) {
		const [notifications, total] = await Promise.all([
			this.dbService.notification.findMany({
				skip: (page - 1) * limit,
				take: +limit,
				orderBy: { create_at: 'desc' },
				include: {
					_count: {
						select: { user_notifications: true }
					}
				}
			}),
			this.dbService.notification.count()
		]);

		const processedNotifications = await Promise.all(
			notifications.map(async n => {
				const read_count = await this.dbService.userNotification.count({
					where: { notification_id: n.id, is_read: true }
				});
				const total_users = n.target_user ? 1 : await this.dbService.user.count();
				const unread_count = total_users - read_count;
				return { ...n, read_count, unread_count };
			})
		);

		return { notifications: processedNotifications, total };
	}

	/**
	 * 获取用户通知列表
	 * @param userId 用户ID
	 * @param page 页码
	 * @param limit 每页数量
	 * @param is_read 是否已读，不传入时返回所有通知
	 */
	async getUserNotifications(userId: number, page: number, limit: number, is_read?: boolean) {
		const where: any = {
			OR: [{ target_user: null }, { target_user: userId }]
		};

		const userNotifications = await this.dbService.userNotification.findMany({
			where: { user_id: userId },
			select: { notification_id: true, is_read: true }
		});

		const readNotificationIds = userNotifications
			.filter(un => un.is_read)
			.map(un => un.notification_id);

		if (is_read === true) {
			where.id = { in: readNotificationIds };
		} else if (is_read === false) {
			where.id = { notIn: readNotificationIds };
		}

		const [notifications, total] = await Promise.all([
			this.dbService.notification.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { create_at: 'desc' }
			}),
			this.dbService.notification.count({ where })
		]);

		const unread_count = await this.dbService.notification.count({
			where: {
				OR: [{ target_user: null }, { target_user: userId }],
				id: { notIn: readNotificationIds }
			}
		});

		const result = notifications.map(n => ({
			...n,
			is_read: readNotificationIds.includes(n.id)
		}));

		return { notifications: result, total, unread_count };
	}

	/**
	 * 将通知标记为已读
	 * @param userId 用户ID
	 * @param notificationId 通知ID
	 */
	async markNotificationAsRead(userId: number, notificationId: number) {
		const existing = await this.dbService.userNotification.findUnique({
			where: { user_id_notification_id: { user_id: userId, notification_id: notificationId } }
		});

		if (!existing) {
			return this.dbService.userNotification.create({
				data: { user_id: userId, notification_id: notificationId, is_read: true }
			});
		} else if (!existing.is_read) {
			return this.dbService.userNotification.update({
				where: { id: existing.id },
				data: { is_read: true }
			});
		}
	}

	/**
	 * 将用户的所有未读通知标记为已读
	 * @param userId 用户ID
	 */
	async markAllNotificationsAsRead(userId: number) {
		// 获取用户可见的所有通知ID
		const allNotifications = await this.dbService.notification.findMany({
			where: {
				OR: [{ target_user: null }, { target_user: userId }]
			},
			select: { id: true }
		});

		const allNotificationIds = allNotifications.map(n => n.id);

		// 获取用户已有的通知记录
		const existingUserNotifications = await this.dbService.userNotification.findMany({
			where: {
				user_id: userId,
				notification_id: { in: allNotificationIds }
			}
		});

		const existingNotificationIds = existingUserNotifications.map(un => un.notification_id);

		// 批量更新已存在但未读的记录
		await this.dbService.userNotification.updateMany({
			where: {
				user_id: userId,
				notification_id: { in: existingNotificationIds },
				is_read: false
			},
			data: { is_read: true }
		});

		// 为没有记录的通知创建已读记录（通知默认不会在用户_通知表中创建记录）
		const newNotificationIds = allNotificationIds.filter(
			id => !existingNotificationIds.includes(id)
		);
		if (newNotificationIds.length > 0) {
			await this.dbService.userNotification.createMany({
				data: newNotificationIds.map(notificationId => ({
					user_id: userId,
					notification_id: notificationId,
					is_read: true
				}))
			});
		}

		return { success: true, markedCount: allNotificationIds.length };
	}
}
