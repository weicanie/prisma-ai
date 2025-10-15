import { Injectable, Logger } from '@nestjs/common';
import { ProjectVo, UserInfoFromToken } from '@prisma-ai/shared';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { PersistentTask } from '../../type/taskqueue';
import { PrismaAgentService } from '../prisma-agent/prisma-agent.service';

interface LightspotImplementTask extends PersistentTask {
	metadata: {
		project: ProjectVo;
		lightspot: string;
		projectPath: string;
		userInfo: UserInfoFromToken;
		sessionId: string;
	};
}

@Injectable()
export class ProjectImplementService {
	static readonly taskTypeLightspotImplement = 'lightspot_implement';
	private readonly logger = new Logger(ProjectImplementService.name);

	constructor(
		private readonly prismaAgentService: PrismaAgentService,
		private readonly taskQueueService: TaskQueueService
	) {
		try {
			this.taskQueueService.registerTaskHandler(
				ProjectImplementService.taskTypeLightspotImplement,
				this.lightspotImplementTaskHandler.bind(this)
			);
		} catch (error) {
			this.logger.error(`亮点实现任务处理器注册失败: ${error}`);
			throw error;
		}
		this.logger.log(
			`亮点实现任务处理器已注册: ${ProjectImplementService.taskTypeLightspotImplement}`
		);
	}

	async startLightspotImplementTask(
		project: ProjectVo,
		lightspot: string,
		projectPath: string,
		userInfo: UserInfoFromToken,
		sessionId: string
	) {
		const task = await this.taskQueueService.createAndEnqueueTask(
			sessionId,
			userInfo.userId,
			ProjectImplementService.taskTypeLightspotImplement,
			{ project, lightspot, projectPath, userInfo, sessionId }
		);
		this.logger.log(`已创建亮点实现任务: ${task.id}`);
		return task;
	}

	private async processLightspotImplement(
		project: ProjectVo,
		lightspot: string,
		projectPath: string,
		userInfo: UserInfoFromToken,
		sessionId: string
	) {
		return await this.prismaAgentService.invoke(
			project,
			lightspot,
			projectPath,
			userInfo,
			sessionId
		);
	}

	private async lightspotImplementTaskHandler(task: LightspotImplementTask) {
		const { project, lightspot, projectPath, userInfo, sessionId } = task.metadata;
		await this.processLightspotImplement(project, lightspot, projectPath, userInfo, sessionId);
	}
}
