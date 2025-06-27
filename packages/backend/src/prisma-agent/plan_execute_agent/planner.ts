import { RunnableConfig } from '@langchain/core/runnables';
import { Command, END, START, StateGraph } from '@langchain/langgraph';
import * as fs from 'fs/promises';
import * as path from 'path';
import { EventList } from '../../EventBus/event-bus.service';
import { waitForHumanReview } from '../human_involve_agent/node';
import { reflect } from '../reflect_agent/node';
import { GraphState } from '../state';
import { Plan, ReviewType, RunningConfig, UserAction } from '../types';
import { getAgentConfig, updateAgentConfig } from '../utils/config';
//TODO 现在先不更新项目代码知识库,后续使用cursor来感知项目代码库? 增量更新?(通过metadata)
const agentConfigPath = path.join(process.cwd(), 'prisma_agent_config.json');
interface NodeConfig extends RunnableConfig {
	configurable: RunningConfig;
}

// --- Node Implementations ---

/**
 * "上传代码"节点
 * @description 这是一个后台任务启动节点。它会触发一个将项目代码进行嵌入并存入向量数据库的后台任务。
 *              图的执行会在此暂停，直到它监听到任务完成的事件。
 */
export async function uploadCode(
	state: typeof GraphState.State,
	config: NodeConfig
): Promise<Partial<typeof GraphState.State>> {
	const agentConfig = await getAgentConfig();
	if (agentConfig._uploadedProjects.includes(state.projectPath)) {
		return {};
	} else {
		agentConfig._uploadedProjects.push(state.projectPath);
		await updateAgentConfig(agentConfig);
	}

	console.log('---NODE: UPLOAD CODE---');
	const { projectPath, userId, projectInfo, sessionId = crypto.randomUUID() } = state;
	const { projectCodeVDBService, eventBusService } = config.configurable;

	if (!projectPath) throw new Error('Project path is not set');
	if (!userId) throw new Error('User ID is not set');
	if (!projectInfo?.info.name) throw new Error('Project name is not set');
	if (!projectCodeVDBService) throw new Error('projectCodeVDBService not found in runningConfig');

	const task = await projectCodeVDBService.storeToVDB(
		userId,
		projectInfo.info.name,
		projectPath,
		sessionId
	);
	console.log('---CODE UPLOAD AND EMBEDDING STARTED---');

	await new Promise((resolve, reject) => {
		try {
			eventBusService.once(EventList.taskCompleted, ({ task: taskPayload }) => {
				if (task.id === taskPayload.id) {
					resolve(true);
				}
			});
		} catch (error) {
			reject(error);
		}
	});

	console.log('---CODE UPLOAD AND EMBEDDING COMPLETE---');
	return {};
}

/**
 * "检索知识"节点 (retrieveNode)
 * @description 根据功能亮点，从项目代码库和技术知识库中检索相关信息。
 * @input {GraphState} state - 包含项目信息、功能亮点、用户ID等。
 * @output {Partial<GraphState>} - 更新 `state.knowledge`。
 */
export async function retrieveNode(
	state: typeof GraphState.State,
	config: NodeConfig
): Promise<Partial<typeof GraphState.State>> {
	console.log('---Plan NODE: RETRIEVE KNOWLEDGE---');
	const { projectInfo, lightSpot, userId } = state;
	const { knowledgeVDBService, projectCodeVDBService } = config.configurable;
	if (!projectInfo || !lightSpot || !userId || !knowledgeVDBService || !projectCodeVDBService) {
		throw new Error('Missing required state or services in configurable for retrieval.');
	}

	const projectName = projectInfo.info.name;

	console.log(`Retrieving knowledge for: "${lightSpot}"`);

	const agentConfig = await getAgentConfig();
	const [projectDocs, domainDocs] = await Promise.all([
		projectCodeVDBService.retrieveCodeChunks(
			lightSpot,
			agentConfig.topK.plan.projectCode,
			userId,
			projectName
		),
		agentConfig.CRAG
			? knowledgeVDBService.retrieveCodeAndDoc_CRAG(
					lightSpot,
					agentConfig.topK.plan.knowledge,
					userId
				)
			: knowledgeVDBService.retrieveCodeAndDoc(lightSpot, agentConfig.topK.plan.knowledge, userId)
	]);

	console.log(
		`Retrieved ${projectDocs.length} project code snippets and ${domainDocs.length} domain docs.`
	);

	return {
		knowledge: {
			retrievedProjectCodes: projectDocs,
			retrievedDomainDocs: domainDocs
		}
	};
}

/**
 * "需求需求分析"节点 (analyze)
 * @description 调用需求分析Chain，根据项目信息和亮点生成需求需求分析。
 * @input {GraphState} state - 包含项目信息、亮点、以及可选的反思。
 * @output {Partial<GraphState>} - 更新 `plan.output.highlightAnalysis` 和 `humanIO.output`。
 */
export async function analyze(
	state: typeof GraphState.State,
	config: NodeConfig
): Promise<Partial<typeof GraphState.State>> {
	console.log('---Plan NODE: ANALYZE---');
	if (!state.projectInfo) throw new Error('Project info is not set.');
	const { analysisChain } = config.configurable;
	if (!analysisChain) throw new Error('Analysis chain not found in configurable');

	const { projectInfo, lightSpot, reflection, knowledge } = state;

	const result: any = await analysisChain.invoke({
		projectInfo,
		lightSpot,
		knowledge: knowledge ?? undefined,
		reflection: reflection ?? undefined
	});

	const newPlanState: Plan = {
		output: {
			highlightAnalysis: result.highlightAnalysis,
			implementationPlan: []
		}
	};

	return {
		plan: newPlanState,
		humanIO: {
			...state.humanIO,
			output: {
				type: ReviewType.ANALYSIS,
				content: result.highlightAnalysis
			}
		},
		reflection: null // Clear reflection after use
	};
}

/**
 * "制定计划"节点 (plan)
 * @description 调用计划Chain，根据需求需求分析生成实现步骤。
 * @input {GraphState} state - 包含项目信息、亮点、需求需求分析、以及可选的反思。
 * @output {Partial<GraphState>} - 更新 `plan.output.implementationPlan` 和 `humanIO.output`。
 */
export async function plan(
	state: typeof GraphState.State,
	config: NodeConfig
): Promise<Partial<typeof GraphState.State>> {
	console.log('---Plan NODE: PLAN---');
	if (!state.projectInfo) throw new Error('Project info is not set.');
	if (!state.plan?.output.highlightAnalysis) throw new Error('Analysis is not available.');
	const { planChain } = config.configurable;
	if (!planChain) throw new Error('Plan chain not found in configurable');

	const { projectInfo, lightSpot, plan, reflection, knowledge } = state;

	const result: any = await planChain.invoke({
		projectInfo,
		lightSpot,
		highlightAnalysis: plan.output.highlightAnalysis,
		knowledge: knowledge ?? undefined,
		reflection: reflection ?? undefined
	});

	const newPlanState: Plan = {
		...plan,
		output: {
			...plan.output,
			implementationPlan: result.implementationPlan
		}
	};

	return {
		plan: newPlanState,
		humanIO: {
			...state.humanIO,
			output: {
				type: ReviewType.PLAN,
				content: JSON.stringify(result.implementationPlan, null, 2)
			}
		},
		reflection: null // Clear reflection after use
	};
}

/**
 * 准备反思内容的图节点 (For Plan)
 * @description 汇总和格式化所有用于反思的上下文信息。
 * @input {GraphState} state - 从 state 中获取当前分析/计划, 以及用户的反馈。
 * @output {Partial<GraphState>} - 更新 `state.reflectIO.input` 以便 `reflect` 节点可以使用。
 */
export async function prepareReflection(
	state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
	console.log('---Plan NODE: PREPARE REFLECTION---');
	const { plan, humanIO } = state;
	const { type } = humanIO.output!;
	if (!type) {
		throw new Error('Review type is missing in humanIO.output.');
	}

	if (!humanIO?.input) {
		throw new Error('User input is missing for reflection preparation.');
	}

	const userFeedback = humanIO.input.content ?? '无用户反馈';
	let context = '';

	if (type === ReviewType.ANALYSIS) {
		context = `
当前需求分析:
\`\`\`
${plan?.output.highlightAnalysis}
\`\`\`
`;
	} else if (type === ReviewType.PLAN) {
		context = `
当前需求分析:
\`\`\`
${plan?.output.highlightAnalysis}
\`\`\`

当前实现计划:
\`\`\`json
${JSON.stringify(plan?.output.implementationPlan, null, 2)}
\`\`\`
`;
	}

	return {
		reflectIO: {
			input: {
				content: userFeedback,
				context: context
			},
			output: null // Clear previous reflection output
		}
	};
}

// --- Edge Implementations ---

/**
 * 条件边: "是否需要反思" (shouldReflect)
 * @description 在人类审核后，根据用户的行为（接受、拒绝、反馈）来决定下一步走向。
 * @input {GraphState} state - 从 `state.humanIO.input` 获取用户的操作。
 */
export async function shouldReflect(state: typeof GraphState.State): Promise<Command> {
	console.log('---Plan NODE: ROUTE AFTER REVIEW---');

	const { type } = state.humanIO.output!;
	const userInput = state.humanIO.input;

	if (!type) {
		throw new Error('Review type is missing in humanIO.output.');
	}
	if (!userInput) {
		console.error('User input is missing in shouldReflect edge.');
		return new Command({ goto: END }); // Should not happen
	}

	switch (userInput.action) {
		case UserAction.ACCEPT:
			console.log('User accepted. Continuing...');
			switch (type) {
				case ReviewType.ANALYSIS:
					return new Command({ goto: 'plan_top' });
				case ReviewType.PLAN:
					return new Command({ goto: END });
				default:
					throw new Error(`Invalid review type for ACCEPT action: ${type}`);
			}
		case UserAction.REDO:
			console.log('User rejected or provided feedback. Reflecting...');
			return new Command({ goto: 'prepare_reflection' });
		case UserAction.FIX:
			console.log('User fixed. Continuing...');
			if (!state.humanIO.reviewPath) {
				throw new Error('Review path is missing for FIX action.');
			}
			let fixedContentStr = await fs.readFile(state.humanIO.reviewPath, 'utf-8');
			const fileExtension = path.extname(state.humanIO.reviewPath);
			const isJson = fileExtension === '.json';
			const fixedContent = isJson ? JSON.parse(fixedContentStr) : fixedContentStr;

			switch (type) {
				case ReviewType.ANALYSIS: {
					const newPlan: Plan = {
						...state.plan,
						output: {
							highlightAnalysis: fixedContent,
							implementationPlan: state.plan?.output.implementationPlan ?? []
						}
					};
					return new Command({
						goto: 'plan_top',
						update: {
							plan: newPlan
						}
					});
				}
				case ReviewType.PLAN: {
					const newPlan: Plan = {
						...state.plan,
						output: {
							highlightAnalysis: state.plan?.output.highlightAnalysis ?? '',
							implementationPlan: fixedContent
						}
					};
					return new Command({
						goto: END,
						update: {
							plan: newPlan
						}
					});
				}
				default:
					throw new Error(`Invalid review type for FIX action: ${type}`);
			}
		default:
			throw new Error(`Invalid user action: ${userInput.action}`);
	}
}

/**
 * 条件边：反思之后 (afterReflect)
 * @description 在反思节点结束后，根据我们是从哪个阶段（需求分析或计划）进入反思的，来决定是重新需求分析还是重新计划。
 * @input {GraphState} state - 从 `state.humanIO.output.type` 判断反思前的阶段。
 * @output {'analyze' | 'plan' | 'end'} - 返回下一个节点的名称：'analyze', 'plan', 或 'end'（异常情况）。
 */
function afterReflect(state: typeof GraphState.State) {
	console.log('---Plan EDGE: AFTER REFLECT---');
	const reviewType = state.humanIO.output?.type; // Check which stage we were reviewing
	if (!reviewType) {
		throw new Error('Review type is missing in humanIO.output.');
	}
	switch (reviewType) {
		case ReviewType.ANALYSIS:
			console.log('Re-analyzing after reflection...');
			return 'analyze';
		case ReviewType.PLAN:
			console.log('Re-planning after reflection...');
			return 'plan_top';
		default:
			throw new Error('Could not determine next step after reflection.');
	}
}

export const PlanGraph = new StateGraph(GraphState)
	.addNode('uploadCode', uploadCode)
	.addNode('retrieve', retrieveNode)
	.addNode('analyze', analyze)
	.addNode('plan_top', plan)
	.addNode('human_review', waitForHumanReview)
	.addNode('prepare_reflection', prepareReflection)
	.addNode('reflect', reflect)
	.addNode('shouldReflect', shouldReflect, { ends: [END, 'plan_top', 'prepare_reflection'] });

PlanGraph
	// 流程启动，首先进入"上传项目代码"节点
	.addEdge(START, 'uploadCode')
	// 上传完成后，进入"知识检索"节点
	.addEdge('uploadCode', 'retrieve')
	// 检索完成后，进入"需求分析"节点
	.addEdge('retrieve', 'analyze')
	// "需求分析" -> "人类审核"：需求分析完成后，将结果交由人类审核
	.addEdge('analyze', 'human_review')
	// "人类审核" -> "路由"
	.addEdge('human_review', 'shouldReflect')
	// "计划" -> "人类审核"：计划完成后，再次交由人类审核
	.addEdge('plan_top', 'human_review')
	// "准备反思" -> "反思"：准备好输入后，执行反思
	.addEdge('prepare_reflection', 'reflect')
	// "反思" -> ("需求分析" | "计划")：反思结束后，根据 afterReflect 的判断结果决定是重新需求分析还是重新计划
	.addConditionalEdges('reflect', afterReflect, {
		analyze: 'analyze',
		plan_top: 'plan_top'
	});
