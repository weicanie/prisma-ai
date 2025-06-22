import { END, START, StateGraph } from '@langchain/langgraph';
import { randomUUID } from 'crypto';
import { EventList } from '../../EventBus/event-bus.service';
import { waitForHumanReview } from '../human_involve_agent/node';
import { reflect } from '../reflact_agent/node';
import { GraphState } from '../state';
import { Plan, ReviewType, UserAction } from '../types';

// --- Node Implementations ---

/**
 * "检索知识"节点 (retrieveNode)
 * @description 根据功能亮点，从项目代码库和技术知识库中检索相关信息。
 * @input {GraphState} state - 包含项目信息、功能亮点、用户ID等。
 * @output {Partial<GraphState>} - 更新 `state.knowledge`。
 */
export async function retrieveNode(
	state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
	console.log('---NODE: RETRIEVE KNOWLEDGE---');
	const { projectInfo, lightSpot, userId, runningConfig } = state;
	if (!projectInfo || !lightSpot || !userId || !runningConfig) {
		throw new Error('Missing required state for retrieval.');
	}
	const { knowledgeVDBService, projectCodeVDBService } = runningConfig;
	const projectName = projectInfo.info.name;

	console.log(`Retrieving knowledge for: "${lightSpot}"`);

	const [projectDocs, domainDocs] = await Promise.all([
		projectCodeVDBService.retrieveCodeChunks(lightSpot, 5, userId, projectName),
		knowledgeVDBService.retrieveCodeAndDoc_CRAG(lightSpot, 5, userId)
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
 * "上传代码"节点
 * @description 这是一个后台任务启动节点。它会触发一个将项目代码进行嵌入并存入向量数据库的后台任务。
 *              图的执行会在此暂停，直到它监听到任务完成的事件。
 * @input {GraphState} state - 从state中获取项目路径、用户ID、项目信息等。
 * @output {Partial<GraphState>} - 返回一个空对象，仅用于推进图。
 */
export async function uploadCode(
	state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
	console.log('---NODE: UPLOAD CODE---');
	const { projectPath, userId, projectInfo, sessionId = randomUUID() } = state;
	const projectCodeVDBService = state.runningConfig?.projectCodeVDBService;

	//删除旧的项目代码索引
	try {
		await projectCodeVDBService.deleteIndex(userId, projectInfo!.info.name);
	} catch (error) {
		console.error('Error deleting old project code index:', error);
	}

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
			state.runningConfig.eventBusService.once(EventList.taskCompleted, ({ task: taskPayload }) => {
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
 * "需求需求分析"节点 (analyze)
 * @description 调用需求分析Chain，根据项目信息和亮点生成需求需求分析。
 * @input {GraphState} state - 包含项目信息、亮点、以及可选的反思。
 * @output {Partial<GraphState>} - 更新 `plan.output.highlightAnalysis` 和 `humanIO.output`。
 */
export async function analyze(
	state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
	console.log('---NODE: ANALYZE---');
	if (!state.projectInfo) throw new Error('Project info is not set.');
	if (!state.runningConfig?.analysisChain)
		throw new Error('Analysis chain not found in runningConfig');

	const { analysisChain } = state.runningConfig;
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
	state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
	console.log('---NODE: PLAN---');
	if (!state.projectInfo) throw new Error('Project info is not set.');
	if (!state.plan?.output.highlightAnalysis) throw new Error('Analysis is not available.');
	if (!state.runningConfig?.planChain) throw new Error('Plan chain not found in runningConfig');

	const { planChain } = state.runningConfig;
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
	console.log('---PLAN NODE: PREPARE REFLECTION---');
	const { plan, humanIO } = state;

	if (!humanIO?.input) {
		throw new Error('User input is missing for reflection preparation.');
	}

	const reviewType = humanIO.output?.type;
	const userFeedback = humanIO.input.content ?? '无用户反馈';
	let context = '';

	if (reviewType === ReviewType.ANALYSIS) {
		context = `
当前需求分析:
\`\`\`
${plan?.output.highlightAnalysis}
\`\`\`
`;
	} else if (reviewType === ReviewType.PLAN) {
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
 * @returns {'reflect' | 'end'} - 如果用户提供了反馈或拒绝，则流向 `reflect` 分支；如果接受，则结束。
 */
export function shouldReflect(
	state: typeof GraphState.State
): 'prepare_reflection' | 'end' | 'analyze' {
	console.log('---EDGE: SHOULD REFLECT---');
	const userInput = state.humanIO.input;
	if (!userInput) {
		console.error('User input is missing in shouldReflect edge.');
		return 'end'; // Should not happen
	}

	if (userInput.action === UserAction.ACCEPT) {
		console.log('User accepted. Continuing...');
		return 'end';
	} else {
		console.log('User rejected or provided feedback. Reflecting...');
		return 'prepare_reflection';
	}
}

/**
 * 条件边：反思之后 (afterReflect)
 * @description 在反思节点结束后，根据我们是从哪个阶段（需求分析或计划）进入反思的，来决定是重新需求分析还是重新计划。
 * @input {GraphState} state - 从 `state.humanIO.output.type` 判断反思前的阶段。
 * @output {'analyze' | 'plan' | 'end'} - 返回下一个节点的名称：'analyze', 'plan', 或 'end'（异常情况）。
 */
function afterReflect(state: typeof GraphState.State): 'analyze' | 'plan' | 'end' {
	console.log('---EDGE: AFTER REFLECT---');
	const reviewType = state.humanIO.output?.type; // Check which stage we were reviewing
	if (reviewType === ReviewType.ANALYSIS) {
		console.log('Re-analyzing after reflection...');
		return 'analyze';
	}
	if (reviewType === ReviewType.PLAN) {
		console.log('Re-planning after reflection...');
		return 'plan';
	}
	console.error('Could not determine next step after reflection.');
	return 'end'; // Should not happen
}

export const PlanGraph = new StateGraph(GraphState)
	.addNode('uploadCode', uploadCode)
	.addNode('retrieve', retrieveNode)
	.addNode('analyze', analyze)
	.addNode('plan_top', plan)
	.addNode('prepare_reflection', prepareReflection)
	.addNode('reflect', reflect)
	.addNode('human_review', waitForHumanReview);

PlanGraph
	// 流程启动，首先进入"上传项目代码"节点
	.addEdge(START, 'uploadCode')
	// 上传完成后，进入"知识检索"节点
	.addEdge('uploadCode', 'retrieve')
	// 检索完成后，进入"需求分析"节点
	.addEdge('retrieve', 'analyze')
	// "需求分析" -> "人类审核"：需求分析完成后，将结果交由人类审核
	.addEdge('analyze', 'human_review')
	// "人类审核" -> ("准备反思" | "计划")：根据 shouldReflect 的判断结果决定走向
	.addConditionalEdges('human_review', shouldReflect, {
		prepare_reflection: 'prepare_reflection',
		continue: 'plan_top', // 用户接受，则继续"计划"
		end: END // 异常情况，结束流程
	})
	// "准备反思" -> "反思"：准备好输入后，执行反思
	.addEdge('prepare_reflection', 'reflect')
	// "反思" -> ("需求分析" | "计划")：反思结束后，根据 afterReflect 的判断结果决定是重新需求分析还是重新计划
	.addConditionalEdges('reflect', afterReflect, {
		analyze: 'analyze',
		plan: 'plan_top',
		end: END
	})
	// "计划" -> "人类审核"：计划完成后，再次交由人类审核
	.addEdge('plan_top', 'human_review');
