import { Injectable, Logger } from '@nestjs/common';
import { ProjectVo } from '@prism-ai/shared';
import { PrismaAgentService } from '../../prisma-agent/prisma-agent.service';
import { PersistentTask, TaskQueueService } from '../../task-queue/task-queue.service';

interface LightspotImplementTask extends PersistentTask {
	metadata: {
		project: ProjectVo;
		lightspot: string;
		projectPath: string;
		userId: string;
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
		userId: string,
		sessionId: string
	) {
		const task = await this.taskQueueService.createAndEnqueueTask(
			sessionId,
			userId,
			ProjectImplementService.taskTypeLightspotImplement,
			{ project, lightspot, projectPath, userId, sessionId }
		);
		this.logger.log(`已创建亮点实现任务: ${task.id}`);
		return task;
	}

	private async processLightspotImplement(
		project: ProjectVo,
		lightspot: string,
		projectPath: string,
		userId: string,
		sessionId: string
	) {
		return await this.prismaAgentService.invoke(project, lightspot, projectPath, userId, sessionId);
	}

	private async lightspotImplementTaskHandler(task: LightspotImplementTask) {
		const { project, lightspot, projectPath, userId, sessionId } = task.metadata;
		await this.processLightspotImplement(project, lightspot, projectPath, userId, sessionId);
	}
}
