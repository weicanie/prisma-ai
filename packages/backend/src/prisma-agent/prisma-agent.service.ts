import { END, interrupt, START, StateGraph } from '@langchain/langgraph';
import { Injectable } from '@nestjs/common';
import { ProjectDto } from '@prism-ai/shared';
import { EventBusService } from '../EventBus/event-bus.service';
import { ModelService } from '../model/model.service';
import { CRetrieveAgentService } from './c_retrieve_agent/c_retrieve_agent.service';
import { KnowledgeVDBService } from './data_base/konwledge_vdb.service';
import { ProjectCodeVDBService } from './data_base/project_code_vdb.service';
import { PlanExecuteAgentService } from './plan_execute_agent/plan_execute_agent.service';
import { PlanStepAgentService } from './plan_step_agent/plan_step_agent.service';
import { ReflectAgentService } from './reflact_agent/reflact_agent.service';
import { GraphState } from './state';
import { Result_step, RunningConfig } from './types';
//TODO 测试整个链路

@Injectable()
export class PrismaAgentService {
	private workflow: ReturnType<typeof this.buildGraph>;

	constructor(
		private readonly planExecuteAgentService: PlanExecuteAgentService,
		private readonly planStepAgentService: PlanStepAgentService,
		private readonly reflectAgentService: ReflectAgentService,
		private readonly cRetrieveAgentService: CRetrieveAgentService,
		private readonly knowledgeVDBService: KnowledgeVDBService,
		private readonly projectCodeVDBService: ProjectCodeVDBService,
		private readonly eventBusService: EventBusService,
		private readonly modelService: ModelService
	) {
		this.workflow = this.buildGraph();
		// visualizeGraph(this.workflow, 'prisma-agent');
		// visualizeGraph(this.planStepAgentService.getWorkflow(), 'plan_step_agent');
		// visualizeGraph(this.planExecuteAgentService.getPlanWorkflow(), 'plan_agent');
		// visualizeGraph(this.planExecuteAgentService.getReplanWorkflow(), 'replan_agent');
	}

	/**
	 * @description 构建主工作流图 (Workflow Graph)。
	 * 这个图是整个 Prisma-Agent 的核心，它通过调用子Agent的服务来编排整个流程。
	 * 流程:
	 * 1. START -> plan_execute: 从高阶计划开始。
	 * 2. plan_execute -> plan_step: 高阶计划制定完成后，进入步骤计划阶段。
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
			.addConditionalEdges(
				'replan',
				(state: typeof GraphState.State) => {
					if (state.done) {
						return END;
					} else {
						return 'plan_step';
					}
				},
				{
					['plan_step']: 'plan_step',
					[END]: END
				}
			);

		return workflow.compile();
	}

	/**
	 * "执行步骤"节点 (execute_step)
	 * @description 这是一个中断节点，用于暂停工作流，等待开发者完成当前步骤的编码任务。
	 * 它通过 `interrupt` 将步骤计划返回给调用方，并等待调用方通过API传入该步骤的执行结果。
	 * @input {GraphState} state - 从 `state.stepPlan` 获取当前步骤的详细计划。
	 * @output {Partial<GraphState>} - 更新 `stepResultList` 和 `currentStepIndex`。
	 */
	private async executeStep(
		state: typeof GraphState.State
	): Promise<Partial<typeof GraphState.State>> {
		console.log('---NODE: EXECUTE STEP---');
		console.log('Waiting for developer to execute the step and provide results...');

		//TODO 实现用户结果传回后的恢复逻辑
		// 在实际场景中，这是与UI或其他系统集成的地方
		// 从开发人员那里获取结果
		// 在这里，我们使用中断函数暂停图的执行
		const stepResult: Result_step = interrupt({
			message: 'Please execute the current step and provide the results.',
			stepPlan: state.stepPlan
		});

		console.log('---STEP RESULT RECEIVED---');
		return {
			stepResultList: [stepResult],
			currentStepIndex: state.currentStepIndex + 1
		};
	}

	public async invoke(
		projectInfo: ProjectDto,
		lightSpot: string,
		projectPath: string,
		userId: string,
		sessionId: string
	) {
		const runningConfig: RunningConfig = {
			analysisChain: this.planExecuteAgentService.createAnalysisChain(),
			planChain: this.planExecuteAgentService.createPlanChain(),
			reAnalysisChain: this.planExecuteAgentService.createReAnalysisChain(),
			rePlanChain: this.planExecuteAgentService.createRePlanChain(),
			stepAnalysisChain: this.planStepAgentService.createAnalysisChain(),
			stepPlanChain: this.planStepAgentService.createPlanChain(),
			finalPromptChain: this.planStepAgentService.createFinalPromptChain(),
			reflectChain: this.reflectAgentService.createReflectChain(),
			knowledgeVDBService: this.knowledgeVDBService,
			projectCodeVDBService: this.projectCodeVDBService,
			cRetrieveAgentService: this.cRetrieveAgentService,
			eventBusService: this.eventBusService
		};

		const resultState = await this.workflow.invoke({
			projectInfo,
			lightSpot,
			projectPath,
			userId,
			sessionId,
			runningConfig
		});

		return resultState;
	}
}
