import { Command, END, START, StateGraph } from '@langchain/langgraph';
import * as fs from 'fs/promises';
import * as path from 'path';
import { waitForHumanReview } from '../human_involve_agent/node';
import { reflect } from '../reflect_agent/node';
import { GraphState } from '../state';
import { NodeConfig, Plan_step, ReviewType, UserAction } from '../types';
import { getAgentConfig } from '../utils/config';

type ChainReturned<T extends (...args: any) => any> = T extends (...args: any) => infer R
	? R
	: never;

// --- Node Implementations ---

/**
 * "检索知识"节点 (retrieveNode)
 * @description 根据当前步骤，从项目代码库和技术知识库中检索相关信息。
 * @input {GraphState} state - 包含项目信息、当前步骤、用户ID等。
 * @output {Partial<GraphState>} - 更新 `state.stepPlan.knowledge`。
 */
async function retrieveNode(
	state: typeof GraphState.State,
	config: NodeConfig
): Promise<Partial<typeof GraphState.State>> {
	config.configurable.logger.log('---节点: 检索知识---');
	const { projectInfo, plan, currentStepIndex, userId } = state;
	const knowledgeVDBService = config.configurable?.knowledgeVDBService;
	const projectCodeVDBService = config.configurable?.projectCodeVDBService;
	if (!knowledgeVDBService || !projectCodeVDBService) {
		throw new Error('Missing required services for step retrieval.');
	}
	if (!projectInfo || !plan || !userId) {
		throw new Error('Missing required state for step retrieval.');
	}
	const projectName = projectInfo.name;
	const currentStep = plan.output.implementationPlan[currentStepIndex];
	const query = currentStep.stepDescription;

	config.configurable.logger.log(`检索知识: 根据步骤 "${query}" 检索项目代码和领域知识`);
	const agentConfig = await getAgentConfig(config.configurable.userId);

	const [projectDocs, domainDocs] = await Promise.all([
		projectCodeVDBService.retrieveCodeChunks(
			query,
			agentConfig.topK.plan_step.projectCode,
			config.configurable.userInfo,
			projectName
		),
		agentConfig.CRAG
			? knowledgeVDBService.retrieveKonwbase_CRAG(
					query,
					agentConfig.topK.plan_step.knowledge,
					config.configurable.userInfo,

					projectName
				)
			: knowledgeVDBService.retrieveKnowbase(
					query,
					agentConfig.topK.plan_step.knowledge,
					config.configurable.userInfo,

					projectName
				)
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
	state: typeof GraphState.State,
	config: NodeConfig
): Promise<Partial<typeof GraphState.State>> {
	config.configurable.logger.log('---节点: 分析步骤---');
	const { projectInfo, plan, currentStepIndex, reflection, stepPlan } = state;
	if (!projectInfo || !plan) throw new Error('Project info or plan not set.');
	const stepAnalysisChain = config.configurable?.stepAnalysisChain;
	if (!stepAnalysisChain) throw new Error('Step analysis chain not found in configurable');

	const currentStep = plan.output.implementationPlan[currentStepIndex];

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
async function planStep(
	state: typeof GraphState.State,
	config: NodeConfig
): Promise<Partial<typeof GraphState.State>> {
	config.configurable.logger.log('---节点: 计划步骤---');
	const { stepPlan, reflection } = state;
	if (!stepPlan) throw new Error('Step plan not set.');

	const stepPlanChain = config.configurable?.stepPlanChain;
	if (!stepPlanChain) throw new Error('Step plan chain not found in configurable');

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
	state: typeof GraphState.State,
	config: NodeConfig
): Promise<Partial<typeof GraphState.State>> {
	config.configurable.logger.log('---节点: 生成最终Prompt---');
	const { stepPlan } = state;
	const finalPromptChain = config.configurable?.finalPromptChain;
	if (!stepPlan || !finalPromptChain) {
		throw new Error('Missing stepPlan or finalPromptChain for final prompt generation.');
	}

	const finalPrompt = await finalPromptChain.invoke({
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
	state: typeof GraphState.State,
	config: NodeConfig
): Promise<Partial<typeof GraphState.State>> {
	config.configurable.logger.log('---节点: 写入Prompt到文件---');
	const { finalPrompt, projectPath } = state;
	if (!finalPrompt || !projectPath) {
		throw new Error('Missing finalPrompt or projectPath.');
	}

	//写入agent_output/cursor_input.md
	const cursorInputPath = path.join(process.cwd(), 'agent_output', 'cursor_input.md');
	await fs.writeFile(cursorInputPath, finalPrompt);

	config.configurable.logger.log(`最终Prompt已写入 ${cursorInputPath}`);

	return {};
}

/**
 * 在人类审核之后 (afterReview)
 * @description 根据审核的阶段和用户的操作决定下一步。
 * @param state
 */
async function shouldReflect(state: typeof GraphState.State, config: NodeConfig) {
	config.configurable.logger.log('---边: 是否反思---');
	const { type } = state.humanIO.output!;
	const userInput = state.humanIO.input;

	if (!type) {
		throw new Error('Review type is missing in humanIO.output.');
	}
	if (!userInput) {
		throw new Error('User input is missing in shouldReflect edge.'); //should not happen
	}

	switch (userInput.action) {
		case UserAction.ACCEPT:
			config.configurable.logger.log('用户接受了. 继续...');
			switch (type) {
				case ReviewType.ANALYSIS_STEP:
					return new Command({ goto: 'plan_step' });
				case ReviewType.PLAN_STEP:
					return new Command({ goto: 'generate_final_prompt' });
				default:
					throw new Error('Invalid review type');
			}
		case UserAction.REDO:
			config.configurable.logger.log('用户进行了回绝或提供了反馈. 反思...');
			return new Command({ goto: 'prepare_reflection' });
		case UserAction.FIX:
			config.configurable.logger.log('用户进行了修正. 继续...');
			let fixedContent = await fs.readFile(state.humanIO.reviewPath!, 'utf-8');
			const fileExtension = path.extname(state.humanIO.reviewPath!);
			const isJson = fileExtension === '.json';
			fixedContent = isJson ? JSON.parse(fixedContent) : fixedContent;
			switch (type) {
				case ReviewType.ANALYSIS_STEP:
					return new Command({
						goto: 'plan_step',
						update: {
							stepPlan: {
								output: {
									implementationPlan: state.stepPlan?.output.implementationPlan,
									stepAnalysis: fixedContent
								},
								knowledge: state.stepPlan?.knowledge
							}
						}
					});
				case ReviewType.PLAN_STEP:
					return new Command({
						goto: 'generate_final_prompt',
						update: {
							stepPlan: {
								output: {
									implementationPlan: fixedContent,
									stepAnalysis: state.stepPlan?.output.stepAnalysis
								},
								knowledge: state.stepPlan?.knowledge
							}
						}
					});
				default:
					throw new Error('Invalid review type');
			}
		default:
			throw new Error('Invalid user action');
	}
}

// --- Edge Implementations ---

/**
 * 条件边：反思之后 (afterReflect)
 * @description 在反思节点结束后，根据我们是从哪个阶段（分析或计划）进入反思的，来决定是重新分析还是重新计划。
 * @input {GraphState} state - 从 `state.humanIO.output.type` 判断反思前的阶段。
 * @output {'analyze_step' | 'plan_step' | 'end'} - 返回下一个节点的名称：'analyze_step', 'plan_step', 或 'end'（异常情况）。
 */
function afterReflect(
	state: typeof GraphState.State,
	config: NodeConfig
): 'analyze_step' | 'plan_step' | 'end' {
	config.configurable.logger.log('---边: 反思后路由---');
	const reviewType = state.humanIO.output?.type; // Check which stage we were reviewing
	if (!reviewType) {
		throw new Error('Review type is missing in humanIO.output.');
	}
	switch (reviewType) {
		case ReviewType.ANALYSIS_STEP:
			config.configurable.logger.log('重新分析...');
			return 'analyze_step';
		case ReviewType.PLAN_STEP:
			config.configurable.logger.log('重新计划...');
			return 'plan_step';
		default:
			config.configurable.logger.error('无法确定下一步.');
			return 'end'; // Should not happen
	}
}

/**
 * "准备反思"节点 (prepareReflection)
 * @description 在进入反思节点前，准备好需要反思的内容和上下文。
 * @input {GraphState} state - 从 `state.stepPlan` 和 `state.humanIO` 获取内容。
 *                           - 根据 `humanIO.output.type` 判断是步骤分析内容还是步骤计划内容。
 * @output {Partial<GraphState>} - 更新 `reflectIO.input`，为 `reflect` 节点提供输入。
 */
function prepareReflection(
	state: typeof GraphState.State,
	config: NodeConfig
): Partial<typeof GraphState.State> {
	config.configurable.logger.log('---节点: 准备反思---');
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

const PlanStepGraph = new StateGraph(GraphState)
	.addNode('retrieve', retrieveNode)
	.addNode('analyze_step', analyzeStep)
	.addNode('plan_step', planStep)
	.addNode('prepare_reflection', prepareReflection)
	.addNode('reflect', reflect)
	.addNode('human_review', waitForHumanReview)
	.addNode('generate_final_prompt', generateFinalPromptNode)
	.addNode('write_prompt_to_file', writePromptToFileNode)
	.addNode('shouldReflect', shouldReflect, {
		ends: [END, 'plan_step', 'prepare_reflection', 'generate_final_prompt']
	});

PlanStepGraph.addEdge(START, 'retrieve')
	.addEdge('retrieve', 'analyze_step')
	.addEdge('analyze_step', 'human_review')
	.addEdge('human_review', 'shouldReflect')
	.addEdge('prepare_reflection', 'reflect')
	.addConditionalEdges('reflect', afterReflect, {
		analyze_step: 'analyze_step',
		plan_step: 'plan_step'
	})
	.addEdge('plan_step', 'human_review')
	.addEdge('generate_final_prompt', 'write_prompt_to_file')
	.addEdge('write_prompt_to_file', END);
export { PlanStepGraph };
