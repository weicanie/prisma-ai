import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { ChainService } from '../chain/chain.service';

import {
	ProjectExperience,
	projectMinedSchema,
	projectPolishedSchema,
	projectSchema
} from '@prism-ai/shared';
import { DiyStateGraph } from './DiyStateGraph';
import EventBus from './EventBus';

@Injectable()
export class GraphService {
	@Inject('EventBus')
	public eventBus: EventBus;
	constructor(private chainService: ChainService) {}

	/** 通用的项目经验优化：专注于前端的项目经验优化, 强调ai和用户协作
	 * @description 1、转换、检查、补全项目经验信息
	 * @description 2、现有亮点评估、改进
	 * @description 3、亮点挖掘、生成
	 */
	async projectGraph(project: ProjectExperience) {
		const stateSchema = z.object({
			project: projectSchema,
			projectPolished: projectPolishedSchema,
			projectMined: projectMinedSchema
		});
		const state: z.infer<typeof stateSchema> = {
			project: {} as z.infer<typeof projectSchema>,
			projectPolished: {} as z.infer<typeof projectPolishedSchema>,
			projectMined: {} as z.infer<typeof projectMinedSchema>
		};

		/* 
		涉及用户协作, 得是异步非阻塞架构, 且得考虑用户中止后的恢复。

		1、事件驱动：节点 -> waitEdge -> {等待用户回应的节点、下一个执行的节点}, 前端在用户回应时调用特定接口, 然后特定 handler 发送事件到 graph 的。

		2、超时中断和恢复：StateGraph集成数据库, 设置超时机制, 超时后储存状态和当前进度到数据库, 用户下次调用时恢复。
		*/
		const graph = new DiyStateGraph<typeof stateSchema>(state, stateSchema);

		graph.compile(this.eventBus);
	}
}
