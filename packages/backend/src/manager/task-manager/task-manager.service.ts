import { Injectable, Logger } from '@nestjs/common';
import { WithFuncPool } from '../../utils/abstract';

/**
 * 任务管理器服务
 * @description
 * 负责统一管理和注册来自不同业务模块的、可作为后台任务执行的函数。
 * 业务模块（如 ProjectModule, ResumeModule）通过此类注册它们的函数池（业务服务名->FuncPool），
 * 而任务执行模块（如 SseSessionManagerSseService）则通过此类来查找并执行这些函数。
 * 这种设计通过一个中心化的任务函数管理器，解耦了业务模块和任务执行模块，消除了循环依赖。
 */
@Injectable()
export class TaskManagerService {
	private readonly logger = new Logger(TaskManagerService.name);
	/**
	 * 存储所有已注册的函数池
	 * poolName -> 服务实例
	 */
	public pools: Record<string, WithFuncPool> = {};

	/**
	 * 注册一个包含多个可执行函数的服务（池）
	 * @param pool 实现了 WithFuncPool 接口的服务实例
	 */
	registerFuncPool(pool: WithFuncPool) {
		if (this.pools[pool.poolName]) {
			this.logger.warn(`函数池 ${pool.poolName} 已存在，将被覆盖。`);
		}
		this.pools[pool.poolName] = pool;
		this.logger.log(`函数池 ${pool.poolName} 已注册。`);
	}
}
