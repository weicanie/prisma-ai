import { Injectable } from '@nestjs/common';
import { ChainService } from '../chain/chain.service';
import {
	ProjectExperience,
	ProjectExperienceMined,
	ProjectExperiencePolished
} from '../chain/types';
import { DiyStateGraph } from './diyStateGraph';

interface ProjectGraphState {
	project?: ProjectExperience;
	projectPolished?: ProjectExperiencePolished;
	projectMined?: ProjectExperienceMined;
}

@Injectable()
export class GraphService {
	constructor(private chainService: ChainService) {}
	/** 通用的项目经验优化：专注于前端的项目经验优化, 强调ai和用户协作
	 * @description 1、获取简历信息
	 * @description 2、检查、补全简历信息
	 * @description 3、现有亮点评估、改进
	 * @description 4、亮点挖掘、生成
	 */
	async projectGraph() {
		const state: ProjectGraphState = {
			project: {},
			projectPolished: {},
			projectMined: {}
		};
		const graph = new DiyStateGraph(state);
		/* 
		涉及用户协作, 得是异步非阻塞架构,且得考虑用户中止后的恢复。
		1、事件驱动：事件总线, 前端在用户回应时调用特定接口,然后handler发送事件到graph。
		2、StateGraph集成数据库,设置超时机制,超时后储存状态和当前状态到数据库,用户下次调用时恢复。（别忘了清理内存）
		*/
	}
}
