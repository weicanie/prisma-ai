import { Command, END, interrupt, MemorySaver, START, StateGraph } from '@langchain/langgraph';
import { Injectable, Logger } from '@nestjs/common';
import { ProjectDto } from '@prism-ai/shared';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as readline from 'readline';
import { ZodError } from 'zod';
import { EventBusService } from '../EventBus/event-bus.service';
import { ModelService } from '../model/model.service';
import { CRetrieveAgentService } from './c_retrieve_agent/c_retrieve_agent.service';
import { KnowledgeVDBService } from './data_base/konwledge_vdb.service';
import { ProjectCodeVDBService, projectsDirPath } from './data_base/project_code_vdb.service';
import { InterruptType } from './human_involve_agent/node';
import { PlanExecuteAgentService } from './plan_execute_agent/plan_execute_agent.service';
import { PlanStepAgentService } from './plan_step_agent/plan_step_agent.service';
import { ReflectAgentService } from './reflect_agent/reflect_agent.service';
import { GraphState } from './state';
import {
	HumanInput,
	humanInputSchema,
	Result_step,
	resultStepSchema,
	ReviewType,
	RunningConfig
} from './types';
//TODO 然后用来测试整个链路
//TODO 将原来的llm调用升级成Agent调用,知识库集成、human review、反思
//TODO 通过mcp server 调用 cursor 的Agent

const outputDir = path.resolve(process.cwd(), 'agent_output');
const humanFeedbackPath = path.join(outputDir, 'human_feedback.json');
const graphStatePath = path.join(outputDir, 'graph_state.json');

@Injectable()
export class PrismaAgentService {
	private readonly logger = new Logger(PrismaAgentService.name);
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
					console.log('---Replan resulted in no steps, ending workflow.---');
					return END;
				}
				// 如果当前步骤索引大于或等于计划步骤数，也结束
				if (state.currentStepIndex >= state.plan.output.implementationPlan.length) {
					console.log('---All replanned steps are completed, ending workflow.---');
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
		state: typeof GraphState.State
	): Promise<Partial<typeof GraphState.State>> {
		console.log('---NODE: EXECUTE STEP---');
		console.log('Waiting for developer to execute the step and provide results...');

		// 保存 stepPlan 到文件
		const stepPlanPath = path.join(outputDir, 'plan_step_for_execution.json');
		await fs.writeFile(stepPlanPath, JSON.stringify(state.stepPlan, null, 2));

		const stepResult: Result_step = interrupt({
			message: 'Please execute the current step and provide the results.',
			stepPlan: state.stepPlan,
			outputPath: stepPlanPath,
			type: InterruptType.ExecuteStep
		});
		stepResult.stepDescription =
			state.plan?.output.implementationPlan?.[state.currentStepIndex]?.stepDescription!;
		console.log('---STEP RESULT RECEIVED---');
		// 返回一个更新列表的函数，而不是直接修改
		return {
			stepResultList: (state.stepResultList || []).concat(stepResult),
			currentStepIndex: state.currentStepIndex + 1
		};
	}

	/**
	 * @description 处理工作流中断，与用户进行命令行交互以获取反馈，并返回一个用于恢复工作流的指令。
	 * @param interrupts - LangGraph 返回的中断对象数组。
	 * @param threadConfig - 当前工作流线程的配置，用于获取状态。
	 * @returns {Promise<Command>} 一个包含用户反馈的 `Command` 对象，用于恢复工作流。
	 */
	private async handleHumanInvolve(
		interrupts: any[],
		threadConfig: { configurable: RunningConfig }
	): Promise<Command> {
		if (!interrupts || interrupts.length === 0) {
			throw new Error('handleHumanInvolve called with no interrupts.');
		}
		// 提取中断信息。在我们的设计中，一次只处理一个中断。
		const interruptData = interrupts[0].value;
		// 总是从主图中获取状态，因为它是整个流程的入口和状态管理者。
		const graph = this.workflow;
		const currentState = await graph.getState(threadConfig);
		// this.logger.debug('🚀 ~ PrismaAgentService ~ currentState:', currentState);
		// 步骤1: 保存当前中断信息到文件，供用户审查和调试。

		await fs.writeFile(
			path.join(outputDir, 'interrupt_payload.json'),
			JSON.stringify(interruptData, null, 2)
		);

		/**
		 * @description 根据中断类型，写入不同的反馈表单到文件。
		 * @param interruptType - 中断类型。
		 */
		const displayHumanFeedback = async (interruptType: InterruptType) => {
			if (interruptType === InterruptType.HumanReview) {
				await fs.writeFile(
					humanFeedbackPath,
					JSON.stringify({ action: 'accept', content: '反馈内容' }, null, 2)
				);
			} else if (interruptType === InterruptType.ExecuteStep) {
				await fs.writeFile(
					humanFeedbackPath,
					JSON.stringify(
						{
							output: {
								userFeedback: '你的反馈内容(你来写)',
								writtenCodeFiles: 'cursor的修改总结清单(由cursor生成)',
								summary: 'cursor的最终总结(由cursor生成)'
							}
						},
						null,
						2
					)
				);
			}
		};

		// 步骤2: 设置命令行界面，用于和用户交互。
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		const askQuestion = (query: string): Promise<string> =>
			new Promise(resolve => rl.question(query, resolve));

		let validatedInput: HumanInput | Result_step | null = null;

		// 步骤3: 进入循环，不断提示用户，直到获得一个有效的输入。
		while (validatedInput === null) {
			// 根据中断的类型（是需要审核，还是需要执行步骤），显示不同的提示信息。
			if (interruptData.type === InterruptType.HumanReview) {
				await displayHumanFeedback(InterruptType.HumanReview);
				// 这是来自 waitForHumanReview 的审核请求
				this.logger.log(`\n=== 需要您审核 (${interruptData.type}) ===`);
				this.logger.log(`1. 请审核输出文件: ${interruptData.outputPath}`);
				this.logger.log(`2. 请在以下文件中输入您的反馈: ${humanFeedbackPath}`);
				this.logger.log(
					`action: accept（完全接受并继续） | fix（手动修改然后继续） | redo（反馈并重做,反馈内容填在content里）`
				);
				this.logger.log(`3. 输入 'do' 继续, 或输入 'exit' 退出.`);
			} else if (interruptData.type === InterruptType.ExecuteStep) {
				await displayHumanFeedback(InterruptType.ExecuteStep);
				// 这是来自 executeStep 的执行请求
				this.logger.log(`\n=== 需要执行步骤 ===`);
				this.logger.log(`1. 请根据以下文件中的描述执行编码任务: ${interruptData.outputPath}`);
				this.logger.log(`2. 请在以下文件中输入结果反馈: ${humanFeedbackPath}`);
				this.logger.log(`3. 输入 'do' 继续, 或输入 'exit' 退出.`);
			} else {
				this.logger.error('未知的中断类型:', interruptData.type);
				throw new Error('未知的中断类型');
			}

			const command = await askQuestion('> ');

			if (command.toLowerCase() === 'exit') {
				rl.close();
				throw new Error('用户中止了流程。');
			}

			// 当用户准备好后，输入'do'，程序会读取反馈文件。
			if (command.toLowerCase() === 'do') {
				try {
					const feedbackContent = await fs.readFile(humanFeedbackPath, 'utf-8');
					const feedbackJson = JSON.parse(feedbackContent);

					// 使用 Zod schema 对用户在文件中输入的内容进行严格的格式校验。
					if (interruptData.type) {
						// 校验 HumanInput
						validatedInput = humanInputSchema.parse(feedbackJson);
					} else {
						// 校验 Result_step
						validatedInput = resultStepSchema.parse(feedbackJson);
					}
					this.logger.log('反馈校验成功。');
				} catch (error) {
					// 如果校验失败，打印详细错误，并让用户重新修改文件。
					if (error instanceof ZodError) {
						this.logger.error('格式校验错误:', error.errors);
						this.logger.error(`文件 ${humanFeedbackPath} 格式错误，请按原格式提交。`);
					} else {
						this.logger.error(`读取或解析 ${humanFeedbackPath} 时出错:`, error);
					}
					validatedInput = null; // 重置 validatedInput，使循环继续。
				}
			}
		}

		rl.close();
		// 步骤4: 将校验通过的用户输入包装成一个 Command 对象，用于恢复 LangGraph 的执行。
		//记录用户可能修改后的内容，用于后续fix、继续执行
		const getReviewPath = (reviewType: ReviewType) => {
			switch (reviewType) {
				case ReviewType.ANALYSIS:
					return path.join(process.cwd(), 'agent_output', 'analysis.md');
				case ReviewType.PLAN:
					return path.join(process.cwd(), 'agent_output', 'plan.json');
				case ReviewType.RE_ANALYSIS:
					return path.join(process.cwd(), 'agent_output', 'analysis.md');
				case ReviewType.RE_PLAN:
					return path.join(process.cwd(), 'agent_output', 'plan.json');
				case ReviewType.ANALYSIS_STEP:
					return path.join(process.cwd(), 'agent_output', 'analysis_step.md');
				case ReviewType.PLAN_STEP:
					return path.join(process.cwd(), 'agent_output', 'plan_step.json');
				default:
					throw new Error('Invalid review type');
			}
		};

		if (interruptData.type === InterruptType.HumanReview) {
			const reviewType = interruptData.reviewType;
			if (!reviewType) {
				throw new Error(
					'Could not determine review type from current state for HumanReview interrupt.'
				);
			}
			const reviewPath = getReviewPath(reviewType);
			return new Command({
				resume: validatedInput,
				update: {
					humanIO: {
						input: validatedInput as HumanInput,
						reviewPath: reviewPath
					}
				}
			});
		} else if (interruptData.type === InterruptType.ExecuteStep) {
			return new Command({
				resume: validatedInput
			});
		} else {
			throw new Error(`Unknown interrupt type: ${interruptData.type}`);
		}
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
	 * @returns {Promise<any>} 工作流执行完成后的最终状态。
	 */
	public async invoke(
		projectInfo: ProjectDto,
		lightSpot: string,
		projectPath: string, //projects目录中的项目文件夹名称
		userId: string,
		sessionId: string
	) {
		const projectFullPath = path.join(projectsDirPath, projectPath);
		// 步骤1: 准备所有子图和节点可能需要的运行时依赖。
		// 这些依赖项通过 `configurable` 对象注入到图的执行中。
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

		// 步骤2: 构建线程配置，它将被传递给工作流的 stream 方法。
		const threadConfig = {
			configurable: {
				...runningConfig,
				thread_id: sessionId
			} as RunningConfig
		};

		// 步骤3: 定义工作流的初始状态。
		const initialState = {
			projectInfo,
			lightSpot,
			projectPath: projectFullPath,
			userId,
			sessionId
		};

		let finalState: any;
		let input: any = initialState;
		let shouldContinue = true;

		// 步骤4: 使用 while 循环来支持任意次数的中断和恢复。
		// 这是实现健壮的人类参与工作流（human-in-the-loop）的关键。
		while (shouldContinue) {
			shouldContinue = false; // 假设当前流程会执行完毕，除非遇到中断。

			// 启动或恢复工作流的执行流。
			// 第一次循环时，`input` 是 `initialState`。
			// 如果发生中断并恢复，`input` 将是 `Command({ resume: ... })` 对象。
			const stream = await this.workflow.stream(input, threadConfig);

			// 迭代处理执行流中的每一个事件（chunk）。
			for await (const chunk of stream) {
				// this.logger.debug('---STREAM CHUNK---', JSON.stringify(chunk, null, 2));

				// 检查事件是否是中断信号。

				if (chunk.__interrupt__) {
					const interruptData = chunk.__interrupt__;

					// 调用 handleHumanInvolve 函数，与用户进行交互，并获取恢复指令。
					const resumeCommand = await this.handleHumanInvolve(interruptData, threadConfig);

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
		// 步骤5: 返回工作流的最终状态。
		return finalState;
	}
}
