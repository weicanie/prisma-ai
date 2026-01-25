import { Command, END, interrupt, MemorySaver, START, StateGraph } from '@langchain/langgraph';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
	ProjectDto,
	SelectedLLM,
	SseFunc,
	type SsePipeManager,
	SsePipeStatusMap,
	StreamingChunk,
	UserFeedback,
	UserInfoFromToken,
	WithFuncPool
} from '@prisma-ai/shared';
import * as path from 'path';

import { from, Observable } from 'rxjs';
import { EventBusService } from '../../EventBus/event-bus.service';
import { ModelService } from '../../model/model.service';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { EventList, InterruptData, ReviewType } from '../../type/eventBus';
import { PersistentTask } from '../../type/taskqueue';
import { user_data_dir } from '../../utils/constants';
import { CRetrieveAgentService } from './c_retrieve_agent/c_retrieve_agent.service';
import { PrismaAgentCLIAdapter } from './cli.adapter';
import { KnowledgeVDBService } from './data_base/konwledge_vdb.service';
import { ProjectCodeVDBService } from './data_base/project_code_vdb.service';
import { InterruptType } from './human_involve_agent/node';
import { PlanExecuteAgentService } from './plan_execute_agent/plan_execute_agent.service';
import { PlanStepAgentService } from './plan_step_agent/plan_step_agent.service';
import { ReflectAgentService } from './reflect_agent/reflect_agent.service';
import { GraphState } from './state';
import { NodeConfig, Result_step, RunningConfig } from './types';

export interface RunAgentTask extends PersistentTask {
	metadata: {
		args: PrismaAgentService['invoke'] extends (...args: infer Args) => any ? Args : never;
	};
}

@Injectable()
export class PrismaAgentService implements OnModuleInit, WithFuncPool {
	private readonly logger = new Logger('Prisma Agent');
	private workflow: ReturnType<typeof this.buildGraph>;

	ssePipeStatusMap: SsePipeStatusMap = {};

	public funcPool: Record<string, SseFunc>;
	poolName = 'PrismaAgentService';

	/**
	 * 任务类型字段,用于指定任务处理器
	 */
	taskType = {
		runAgent: 'PrismaAgentService_run_agent'
	};

	constructor(
		private readonly planExecuteAgentService: PlanExecuteAgentService,
		private readonly planStepAgentService: PlanStepAgentService,
		private readonly reflectAgentService: ReflectAgentService,
		private readonly cRetrieveAgentService: CRetrieveAgentService,
		private readonly knowledgeVDBService: KnowledgeVDBService,
		private readonly projectCodeVDBService: ProjectCodeVDBService,
		private readonly eventBusService: EventBusService,
		private readonly modelService: ModelService,
		private readonly taskQueueService: TaskQueueService,
		@Inject('SsePipeManager')
		private readonly sseManager: SsePipeManager
	) {
		this.workflow = this.buildGraph();
		// visualizeGraph(this.workflow, 'prisma-agent');
		// visualizeGraph(this.planStepAgentService.getWorkflow(), 'plan_step_agent');
		// visualizeGraph(this.planExecuteAgentService.getPlanWorkflow(), 'plan_agent');
		// visualizeGraph(this.planExecuteAgentService.getReplanWorkflow(), 'replan_agent');
	}

	onModuleInit() {
		/* 注册任务处理器 */
		try {
			this.taskQueueService.registerTaskHandler(
				this.taskType.runAgent,
				this.runAgentTaskHandler.bind(this)
			);
		} catch (error) {
			this.logger.error(`运行智能体任务处理器注册失败: ${error}`);
			throw error;
		}
		/* 注册sse函数池 */
		this.initFuncPool();
		this.sseManager.registerFuncPool(this);
	}

	/**
	 * 每个运行中的agent维护自己的sse pipe
	 */
	async manageSsePipe(runId: string, action: 'create' | 'delete' = 'create') {
		if (action === 'create') {
			this.ssePipeStatusMap[runId] = {
				hasUndoneStream: false,
				curStream: null
			};
		} else {
			delete this.ssePipeStatusMap[runId];
		}
	}
	/**
	 * 每个运行中的agent维护自己的当前 llm 输出流
	 */
	async manageCurStream(
		runId: string,
		action: 'create' | 'delete' = 'create',
		stream?: Observable<StreamingChunk>,
		interruptType: InterruptType = InterruptType.HumanReview
	) {
		if (action === 'create') {
			this.ssePipeStatusMap[runId].curStream = stream!;
			this.ssePipeStatusMap[runId].hasUndoneStream = true;
			this.ssePipeStatusMap[runId].interruptType = interruptType;
			this.eventBusService.emit(EventList.pa_curSteamCreate, {
				metadata: {
					runId,
					interruptType
				}
			});
		} else {
			this.ssePipeStatusMap[runId].curStream = null;
			this.ssePipeStatusMap[runId].hasUndoneStream = false;
		}
	}

	initFuncPool() {
		this.funcPool = {
			sseAgentCurStream: this.sseAgentCurStream.bind(this)
		};
	}

	/**
	 * sse服务要求的sseFunc
	 */
	async sseAgentCurStream(
		input: { runId: string },
		userInfo: UserInfoFromToken,
		taskId: string,
		userFeedback: UserFeedback,
		model: SelectedLLM
	): Promise<Observable<StreamingChunk>> {
		return (
			this.ssePipeStatusMap[input.runId].curStream ??
			from([
				{
					content: `错误：runId为${input.runId}的agent当前没有正在进行的流`,
					reasonContent: '',
					done: true,
					isReasoning: false
				}
			])
		);
	}

	async startRunAgentTask(
		projectInfo: ProjectDto,
		lightSpot: string,
		projectPath: string, //projects目录中的项目文件夹名称
		userInfo: UserInfoFromToken,
		sessionId: string,
		uiType: 'CLI' | 'WEB' = 'WEB'
	) {
		const args = [projectInfo, lightSpot, projectPath, userInfo, sessionId, uiType];
		const task = await this.taskQueueService.createAndEnqueueTask(
			sessionId,
			userInfo.userId,
			this.taskType.runAgent,
			{ args }
		);
		return task;
	}

	private async runAgentTaskHandler(task: RunAgentTask): Promise<void> {
		const { args } = task.metadata;
		await this.invoke(...args);
	}

	/**
	 * @description 构建主工作流图 (Workflow Graph)。
	 * 这个图是整个 Prisma-Agent 的核心，它通过调用子Agent的服务来编排整个流程。
	 * 流程:
	 * 1. START -> plan_top: 从高阶计划开始。
	 * 2. plan_top -> plan_step: 高阶计划制定完成后，进入步骤计划阶段。
	 * 3. plan_step -> execute_step: 单个步骤的详细计划制定完成后，进入执行阶段（等待开发者）。
	 * 4. execute_step -> plan_step / END: 一个步骤执行后，如果有下一个步骤，则回到 plan_step；否则，结束。
	 */
	private buildGraph() {
		const planGraph = this.planExecuteAgentService.getPlanWorkflow();
		const planStepGraph = this.planStepAgentService.getWorkflow();
		const replanGraph = this.planExecuteAgentService.getReplanWorkflow();

		const workflow = new StateGraph(GraphState)
			.addNode('plan_top', planGraph)
			.addNode('plan_step', planStepGraph)
			.addNode('replan', replanGraph)
			.addNode('execute_step', this.executeStep.bind(this));

		workflow
			.addEdge(START, 'plan_top')
			.addEdge('plan_top', 'plan_step')
			.addEdge('plan_step', 'execute_step')
			.addEdge('execute_step', 'replan')
			// 条件边: 从 'replan' 节点出来后
			// 如果所有步骤都已完成，则结束流程 (END)
			// 否则，对步骤进行计划 (plan_step)
			.addConditionalEdges('replan', (state: typeof GraphState.State) => {
				if (state.done) {
					return END;
				}
				// 如果 plan 为空或者 plan 的步骤为空，则结束
				if (!state.plan || state.plan.output.implementationPlan.length === 0) {
					this.logger.log('---步骤已全部完成，结束工作流---');
					return END;
				}
				// 如果当前步骤索引大于或等于计划步骤数，也结束
				if (state.currentStepIndex >= state.plan.output.implementationPlan.length) {
					this.logger.log('---步骤已全部完成，结束工作流---');
					return END;
				}

				return 'plan_step';
			});

		const checkpointer = new MemorySaver();
		return workflow.compile({ checkpointer });
	}

	/**
	 * "执行步骤"节点 (execute_step)
	 * @description 这是一个中断节点，用于暂停工作流，等待开发者完成当前步骤的编码任务。
	 * 它通过 `interrupt` 将步骤计划返回给调用方，并等待调用方通过API传入该步骤的执行结果。
	 * @input {GraphState} state - 从 `state.stepPlan` 获取当前步骤的详细计划。
	 * @output {Partial<GraphState>} - 更新 `stepResultList` 和 `currentStepIndex`。
	 */
	private async executeStep(
		state: typeof GraphState.State,
		config: NodeConfig
	): Promise<Partial<typeof GraphState.State>> {
		this.logger.log('---节点: 执行步骤---');
		this.logger.log('等待开发者执行步骤并提供结果...');

		const stepResult: Result_step = interrupt({
			content: JSON.stringify(state.stepPlan, null, 2),
			type: InterruptType.ExecuteStep,
			reviewType: ReviewType.Execute_Step
		});
		stepResult.stepDescription =
			state.plan?.output.implementationPlan?.[state.currentStepIndex]?.stepDescription!;
		this.logger.log('---步骤执行结果已接收---');
		return {
			stepResultList: (state.stepResultList || []).concat(stepResult),
			currentStepIndex: state.currentStepIndex + 1
		};
	}

	/**
	 * @description 调用并执行主工作流。
	 * 这是 Prisma-Agent 的入口点，它初始化状态、配置并启动一个循环来处理图的执行，
	 * 包括处理任意次数的中断和恢复，直到工作流完成。
	 * @param projectInfo - 项目信息 DTO。
	 * @param lightSpot - 项目亮点描述。
	 * @param projectPath - 项目在 `projects` 目录下的文件夹名称。
	 * @param userId - 用户ID。
	 * @param sessionId - 会话ID。
	 * @param uiType - 用户界面类型，默认值为 'CLI'。
	 * @returns {Promise<any>} 工作流执行完成后的最终状态。
	 */
	public async invoke(
		projectInfo: ProjectDto,
		lightSpot: string,
		projectPath: string, //projects目录中的项目文件夹名称
		userInfo: UserInfoFromToken,
		sessionId: string,
		uiType: 'CLI' | 'WEB' = 'WEB'
	) {
		const projectFullPath = projectPath
			? path.join(user_data_dir.projectsDirPath(userInfo.userId), projectPath)
			: '';
		const userId = userInfo.userId;
		let adapter: PrismaAgentCLIAdapter | null = null;
		// 支持CLI和WEB UI两种用户界面
		if (uiType === 'CLI') {
			adapter = new PrismaAgentCLIAdapter(this, this.eventBusService);
			adapter.init(userId);
		}
		// 创建sse管道
		this.manageSsePipe(sessionId, 'create');
		// 1、准备所有子图和节点可能需要的运行时依赖。
		// 这些依赖项通过 `configurable` 对象注入到图的执行中。
		const runningConfig: RunningConfig = {
			analysisChain: await this.planExecuteAgentService.createAnalysisChain(userInfo),
			planChain: await this.planExecuteAgentService.createPlanChain(userInfo),
			reAnalysisChain: await this.planExecuteAgentService.createReAnalysisChain(userInfo),
			rePlanChain: await this.planExecuteAgentService.createRePlanChain(userInfo),
			stepAnalysisChain: await this.planStepAgentService.createAnalysisChain(userInfo),
			stepPlanChain: await this.planStepAgentService.createPlanChain(userInfo),
			finalPromptChain: await this.planStepAgentService.createFinalPromptChain(userInfo),
			reflectChain: await this.reflectAgentService.createReflectChain(userInfo),
			knowledgeVDBService: this.knowledgeVDBService,
			projectCodeVDBService: this.projectCodeVDBService,
			cRetrieveAgentService: this.cRetrieveAgentService,
			eventBusService: this.eventBusService,
			logger: this.logger,
			userId,
			userInfo,
			runId: sessionId,
			manageCurStream: this.manageCurStream.bind(this)
		};

		// 2、构建线程配置，它将被传递给工作流的 stream 方法。
		const threadConfig = {
			configurable: {
				...runningConfig,
				thread_id: sessionId,
				user_id: userId
			} as RunningConfig
		};

		// 3、定义工作流的初始状态。
		const initialState = {
			projectInfo,
			lightSpot,
			projectPath: projectFullPath,
			userId,
			sessionId
		};

		let finalState: typeof GraphState.State | null = null;
		let input: any = initialState;
		let shouldContinue = true;

		// 推送开始执行事件
		this.eventBusService.emit(EventList.pa_start, {
			metadata: {
				runId: runningConfig.runId,
				userId: runningConfig.userId
			}
		});

		// 4、使用 while 循环来支持任意次数的中断和恢复。
		// 这是实现健壮的人类参与工作流（human-in-the-loop）的关键。
		while (shouldContinue) {
			shouldContinue = false; // 当前流程会执行完毕，除非遇到中断。

			// 第一次循环时，`input` 是 `initialState`。
			// 如果发生中断并恢复，`input` 将是 `Command({ resume: ... })` 对象。
			const stream = await this.workflow.stream(input, threadConfig);

			// 迭代处理执行流中的每一个事件（chunk）。
			for await (const chunk of stream) {
				// this.logger.debug('---STREAM CHUNK---', JSON.stringify(chunk, null, 2));

				// 检查事件是否是中断信号。
				/** 处理中断与恢复
					工作流中断，等待一个用于恢复工作流的指令。
	 			*/
				if (chunk.__interrupt__) {
					const interruptData: InterruptData = chunk.__interrupt__;
					// 推送中断事件
					this.eventBusService.emit(EventList.pa_interrupt, {
						metadata: {
							runId: runningConfig.runId,
							userId: runningConfig.userId
						},
						interruptData
					});
					const onceCb = resolve => e => {
						if (e.metadata.runId === runningConfig.runId) {
							resolve(e.resumeCommand);
							this.eventBusService.off(EventList.pa_recover, onceCb);
						}
					};
					// 等待用户返回恢复指令
					const resumeCommand = await new Promise<Command>(resolve => {
						this.eventBusService.on(EventList.pa_recover, onceCb(resolve));
					});

					// 将下一个循环的输入设置为恢复指令。
					input = resumeCommand;
					// 设置标志位，表示需要再次进入 while 循环以继续执行。
					shouldContinue = true;
					// 跳出当前的 for...await 循环，因为流已经中断。
					break;
				} else {
					// 如果不是中断，就记录最新的状态。
					// 当循环正常结束时，这将是最终的工作流结果。
					finalState = chunk;
				}
			}
		}

		this.logger.log('---工作流已完成---');

		// 推送执行结束事件
		this.eventBusService.emit(EventList.pa_end, {
			metadata: {
				runId: runningConfig.runId,
				userId: runningConfig.userId
			}
		});

		// 删除sse管道
		this.manageSsePipe(sessionId, 'delete');

		// 5、返回工作流的最终状态。
		if (uiType === 'CLI') {
			adapter?.clean();
		}
		return finalState;
	}
}
