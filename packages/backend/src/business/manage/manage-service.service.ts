import { Inject, Injectable } from '@nestjs/common';
import { WebsiteStatus, WebsiteStatusVo } from '@prisma-ai/shared';
import { DbService } from '../../DB/db.service';
import { TaskQueueService } from '../../task-queue/task-queue.service';

/**
 * 网站服务管理。
 *
 * 功能：
 * 1、获取网站服务状态
 * 2、更新网站服务状态
 *
 * @method getWebsiteStatus
 * @method updateWebsiteStatus
 */
@Injectable()
export class ManageServiceService {
	constructor(
		@Inject(DbService)
		private readonly dbService: DbService,
		@Inject(TaskQueueService)
		private readonly taskQueueService: TaskQueueService
	) {}

	/**
	 * 获取网站服务状态
	 */
	async getWebsiteStatus(): Promise<WebsiteStatusVo> {
		let status = await this.dbService.websiteStatus.findFirst();
		if (!status) {
			// 如果没有状态记录，则创建一个默认的在线状态
			status = await this.dbService.websiteStatus.create({
				data: {
					status: WebsiteStatus.ONLINE,
					message: 'ok'
				}
			});
		}
		const pendingTasks = this.taskQueueService.getQueueLength();
		const runningTasks = this.taskQueueService.getActiveCount();
		return { ...status, pendingTasks, runningTasks } as WebsiteStatusVo;
	}

	/**
	 * 更新网站服务状态
	 * @param status 状态
	 * @param message 消息
	 */
	async updateWebsiteStatus(status: WebsiteStatus, message?: string) {
		const existingStatus = await this.dbService.websiteStatus.findFirst();
		if (existingStatus) {
			return this.dbService.websiteStatus.update({
				where: { id: existingStatus.id },
				data: { status, message }
			});
		} else {
			return this.dbService.websiteStatus.create({
				data: { status, message }
			});
		}
	}
}
