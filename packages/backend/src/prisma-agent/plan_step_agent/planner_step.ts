import { END, START, StateGraph } from '@langchain/langgraph';
import * as fs from 'fs/promises';
import * as path from 'path';
import { waitForHumanReview } from '../human_involve_agent/node';
import { reflect } from '../reflact_agent/node';
import { GraphState } from '../state';
import { Plan_step, ReviewType, UserAction } from '../types';

// --- Node Implementations ---

/**
 * "检索知识"节点 (retrieveNode)
 * @description 根据当前步骤，从项目代码库和技术知识库中检索相关信息。
 * @input {GraphState} state - 包含项目信息、当前步骤、用户ID等。
 * @output {Partial<GraphState>} - 更新 `state.stepPlan.knowledge`。
 */
async function retrieveNode(
	state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
	console.log('---NODE: RETRIEVE KNOWLEDGE FOR STEP---');
	const { projectInfo, plan, currentStepIndex, userId, runningConfig } = state;

	if (!projectInfo || !plan || !userId || !runningConfig) {
		throw new Error('Missing required state for step retrieval.');
	}

	const { knowledgeVDBService, projectCodeVDBService } = runningConfig;
	const projectName = projectInfo.info.name;
	const currentStep = plan.output.implementationPlan[currentStepIndex];
	const query = currentStep.stepDescription;

	console.log(`Retrieving knowledge for step: "${query}"`);

	const [projectDocs, domainDocs] = await Promise.all([
		projectCodeVDBService.retrieveCodeChunks(query, 5, userId, projectName),
		knowledgeVDBService.retrieveCodeAndDoc_CRAG(query, 5, userId)
	]);

	const newStepPlan: Plan_step = {
		output: {
			stepAnalysis: '',
			implementationPlan: []
		},
		knowledge: {
			retrievedProjectCodes: projectDocs,
			retrievedDomainDocs: domainDocs
		}
	};

	return {
		stepPlan: newStepPlan
	};
}

/**
 * "分析步骤"节点 (analyze_step)
 * @description 调用 step analysis chain，对当前执行的步骤进行详细分析。
 * @input {GraphState} state - 必需 `projectInfo`, `plan`, `currentStepIndex`；可选 `reflection`。
 * @output {Partial<GraphState>} - 更新 `stepPlan`（填充步骤分析结果）, `humanIO`（准备让人类审核），并清空 `reflection`。
 */
async function analyzeStep(
	state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
	console.log('---NODE: ANALYZE STEP---');
	const { projectInfo, plan, currentStepIndex, reflection, stepPlan } = state;
	if (!projectInfo || !plan) throw new Error('Project info or plan not set.');
	if (!state.runningConfig?.stepAnalysisChain)
		throw new Error('Step analysis chain not found in runningConfig');

	const currentStep = plan.output.implementationPlan[currentStepIndex];
	const { stepAnalysisChain } = state.runningConfig;
	const result: any = await stepAnalysisChain.invoke({
		projectInfo,
		totalPlan: plan,
		currentStep,
		knowledge: stepPlan?.knowledge,
		reflection: reflection ?? undefined
	});

	const newStepPlan: Plan_step = {
		...stepPlan,
		output: {
			stepAnalysis: result.stepAnalysis,
			implementationPlan: stepPlan?.output.implementationPlan ?? []
		},
		knowledge: stepPlan?.knowledge ?? { retrievedProjectCodes: '', retrievedDomainDocs: '' }
	};

	return {
		stepPlan: newStepPlan,
		humanIO: {
			...state.humanIO,
			output: {
				type: ReviewType.ANALYSIS_STEP,
				content: result.stepAnalysis
			}
		},
		reflection: null
	};
}

/**
 * "计划步骤"节点 (plan_step)
 * @description 调用 step plan chain，为当前步骤生成详细的子步骤计划。
 * @input {GraphState} state - 必需 `stepPlan`（其中包含分析结果）；可选 `reflection`。
 * @output {Partial<GraphState>} - 更新 `stepPlan`（填充子步骤计划）, `humanIO`（准备让人类审核），并清空 `reflection`。
 */
async function planStep(state: typeof GraphState.State): Promise<Partial<typeof GraphState.State>> {
	console.log('---NODE: PLAN STEP---');
	const { stepPlan, reflection } = state;
	if (!stepPlan) throw new Error('Step plan not set.');
	if (!state.runningConfig?.stepPlanChain)
		throw new Error('Step plan chain not found in runningConfig');

	const { stepPlanChain } = state.runningConfig;
	const result: any = await stepPlanChain.invoke({
		stepAnalysis: stepPlan.output.stepAnalysis,
		knowledge: stepPlan.knowledge,
		reflection: reflection ?? undefined
	});

	const newStepPlan = {
		...stepPlan,
		output: {
			...stepPlan.output,
			implementationPlan: result.implementationPlan
		}
	};

	return {
		stepPlan: newStepPlan,
		humanIO: {
			...state.humanIO,
			output: {
				type: ReviewType.PLAN_STEP,
				content: JSON.stringify(result.implementationPlan, null, 2)
			}
		},
		reflection: null
	};
}

/**
 * "生成最终Prompt"节点 (generateFinalPromptNode)
 * @description 调用 final prompt chain 来生成最终给开发者的完整指令。
 * @input {GraphState} state - 包含最终确定的步骤计划 `stepPlan`。
 * @output {Partial<GraphState>} - 更新 `state.finalPrompt`。
 */
async function generateFinalPromptNode(
	state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
	console.log('---NODE: GENERATE FINAL PROMPT---');
	const { stepPlan, runningConfig } = state;
	if (!stepPlan || !runningConfig?.finalPromptChain) {
		throw new Error('Missing stepPlan or finalPromptChain for final prompt generation.');
	}

	const finalPrompt = await runningConfig.finalPromptChain.invoke({
		stepAnalysis: stepPlan.output.stepAnalysis,
		implementationPlan: stepPlan.output.implementationPlan,
		knowledge: stepPlan.knowledge
	});

	return {
		finalPrompt: finalPrompt
	};
}

/**
 * "写入Prompt到文件"节点 (writePromptToFileNode)
 * @description 将最终生成的Prompt写入到 agent_output/cursor_input.md 文件中。
 * @input {GraphState} state - 包含 `finalPrompt` 和 `projectPath`。
 * @output {} - 无状态变更，仅执行文件写入操作。
 */
async function writePromptToFileNode(
	state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
	console.log('---NODE: WRITE PROMPT TO FILE---');
	const { finalPrompt, projectPath } = state;
	if (!finalPrompt || !projectPath) {
		throw new Error('Missing finalPrompt or projectPath.');
	}

	const outputDir = path.join(projectPath, 'agent_output');
	await fs.mkdir(outputDir, { recursive: true });

	const outputPath = path.join(outputDir, 'cursor_input.md');
	await fs.writeFile(outputPath, finalPrompt);

	console.log(`Final prompt written to ${outputPath}`);

	return {};
}

// --- Edge Implementations ---

/**
 * 条件边：在人类审核之后 (afterReview)
 * @description 根据审核的阶段和用户的操作决定下一步。
 * @param state
 * @returns 'plan_step' | 'prepare_reflection' | 'generate_final_prompt' | 'end'
 */
function routeAfterReview(
	state: typeof GraphState.State
): 'plan_step' | 'prepare_reflection' | 'generate_final_prompt' | 'end' {
	console.log('---EDGE: ROUTE AFTER REVIEW---');
	const userInput = state.humanIO.input;
	const reviewType = state.humanIO.output?.type;

	if (userInput?.action !== UserAction.ACCEPT) {
		return 'prepare_reflection';
	}

	if (reviewType === ReviewType.ANALYSIS_STEP) {
		return 'plan_step';
	}

	if (reviewType === ReviewType.PLAN_STEP) {
		return 'generate_final_prompt';
	}

	return 'end';
}

/**
 * 条件边：反思之后 (afterReflect)
 * @description 在反思节点结束后，根据我们是从哪个阶段（分析或计划）进入反思的，来决定是重新分析还是重新计划。
 * @input {GraphState} state - 从 `state.humanIO.output.type` 判断反思前的阶段。
 * @output {'analyze_step' | 'plan_step' | 'end'} - 返回下一个节点的名称：'analyze_step', 'plan_step', 或 'end'（异常情况）。
 */
function afterReflect(state: typeof GraphState.State): 'analyze_step' | 'plan_step' | 'end' {
	const reviewType = state.humanIO.output?.type;
	if (reviewType === ReviewType.ANALYSIS_STEP) return 'analyze_step';
	if (reviewType === ReviewType.PLAN_STEP) return 'plan_step';
	return 'end';
}

/**
 * "准备反思"节点 (prepareReflection)
 * @description 在进入反思节点前，准备好需要反思的内容和上下文。
 * @input {GraphState} state - 从 `state.stepPlan` 和 `state.humanIO` 获取内容。
 *                           - 根据 `humanIO.output.type` 判断是步骤分析内容还是步骤计划内容。
 * @output {Partial<GraphState>} - 更新 `reflectIO.input`，为 `reflect` 节点提供输入。
 */
function prepareReflection(state: typeof GraphState.State): Partial<typeof GraphState.State> {
	const { stepPlan, humanIO, plan } = state;
	const reviewType = humanIO.output?.type;
	const userFeedback = humanIO.input?.content ?? '无用户反馈';
	let context = '';

	if (reviewType === ReviewType.ANALYSIS_STEP) {
		context = `
当前步骤的分析:
\`\`\`
${stepPlan?.output.stepAnalysis}
\`\`\`
所属的总体计划:
\`\`\`json
${JSON.stringify(plan?.output.implementationPlan, null, 2)}
\`\`\`
`;
	} else if (reviewType === ReviewType.PLAN_STEP) {
		context = `
当前步骤的分析:
\`\`\`
${stepPlan?.output.stepAnalysis}
\`\`\`

当前步骤的实现计划:
\`\`\`json
${JSON.stringify(stepPlan?.output.implementationPlan, null, 2)}
\`\`\`
`;
	}

	return {
		reflectIO: {
			input: {
				content: userFeedback,
				context: context
			},
			output: null
		}
	};
}

export const PlanStepGraph = new StateGraph(GraphState)
	.addNode('retrieve', retrieveNode)
	.addNode('analyze_step', analyzeStep)
	.addNode('plan_step', planStep)
	.addNode('prepare_reflection', prepareReflection)
	.addNode('reflect', reflect)
	.addNode('human_review', waitForHumanReview)
	.addNode('generate_final_prompt', generateFinalPromptNode)
	.addNode('write_prompt_to_file', writePromptToFileNode);

PlanStepGraph.addEdge(START, 'retrieve')
	.addEdge('retrieve', 'analyze_step')
	.addEdge('analyze_step', 'human_review')
	.addConditionalEdges('human_review', routeAfterReview, {
		prepare_reflection: 'prepare_reflection',
		plan_step: 'plan_step',
		generate_final_prompt: 'generate_final_prompt',
		end: END
	})
	.addEdge('prepare_reflection', 'reflect')
	.addConditionalEdges('reflect', afterReflect, {
		analyze_step: 'analyze_step',
		plan_step: 'plan_step',
		end: END
	})
	.addEdge('plan_step', 'human_review')
	.addEdge('generate_final_prompt', 'write_prompt_to_file')
	.addEdge('write_prompt_to_file', END);
