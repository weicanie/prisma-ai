import { Inject, Injectable } from '@nestjs/common';
import { DbService } from '../../DB/db.service';

/**
 * 网站用户管理。
 *
 * 权限：管理员。
 *
 * 功能：
 * 1、获取用户列表
 * 2、封禁用户账号
 * 3、解封用户账号
 * 4、记录用户违规
 * 5、查询用户违规
 *
 * @method getUsers
 * @method banUser
 * @method unbanUser
 * @method recordViolation
 * @method getViolations
 */
@Injectable()
export class ManageUserService {
	constructor(
		@Inject(DbService)
		private readonly dbService: DbService
	) {}

	/**
	 * 获取用户列表
	 * @param page 页码
	 * @param limit 每页数量
	 */
	async getUsers(page: number, limit: number) {
		const [users, total] = await Promise.all([
			this.dbService.user.findMany({
				skip: (page - 1) * limit,
				take: limit,
				select: {
					id: true,
					username: true,
					email: true,
					role: true,
					is_banned: true,
					create_at: true
				}
			}),
			this.dbService.user.count()
		]);
		return { users, total };
	}

	/**
	 * 封禁用户
	 * @param userId 用户ID
	 * @param reason 封禁原因
	 */
	async banUser(userId: number, reason?: string) {
		const user = await this.dbService.user.findUnique({ where: { id: userId } });
		if (!user) {
			throw new Error('用户不存在');
		}

		// 封禁用户并同步封禁邮箱
		return this.dbService.$transaction(async tx => {
			await tx.user.update({
				where: { id: userId },
				data: { is_banned: true }
			});

			await tx.bannedEmail.create({
				data: {
					email: user.email,
					reason
				}
			});
		});
	}

	/**
	 * 解封用户
	 * @param userId 用户ID
	 */
	async unbanUser(userId: number) {
		const user = await this.dbService.user.findUnique({ where: { id: userId } });
		if (!user) {
			throw new Error('用户不存在');
		}

		// 解封用户并同步解封邮箱
		return this.dbService.$transaction(async tx => {
			await tx.user.update({
				where: { id: userId },
				data: { is_banned: false }
			});

			await tx.bannedEmail.deleteMany({
				where: {
					email: user.email
				}
			});
		});
	}

	/**
	 * 记录用户违规
	 * @param userId 用户ID
	 * @param type 违规类型
	 * @param description 违规描述
	 */
	async recordViolation(userId: number, type: string, description?: string) {
		const user = await this.dbService.user.findUnique({ where: { id: userId } });
		if (!user) {
			throw new Error('用户不存在');
		}

		return this.dbService.userViolation.create({
			data: {
				user_id: userId,
				email: user.email,
				type,
				description
			}
		});
	}

	/**
	 * 查询用户违规
	 * @param userId 用户ID
	 */
	async getViolations(userId: number) {
		return this.dbService.userViolation.findMany({
			where: { user_id: userId }
		});
	}
}
