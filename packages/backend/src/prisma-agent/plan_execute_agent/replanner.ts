import { END, START, StateGraph } from '@langchain/langgraph';
import * as fs from 'fs/promises';
import * as path from 'path';
import { waitForHumanReview } from '../human_involve_agent/node';
import { reflect } from '../reflact_agent/node';
import { GraphState } from '../state';
import { Plan, ReviewType } from '../types';
import { shouldReflect, uploadCode } from './planner';

/**
 * Replan - Retrieve Node
 * @description 根据用户对上一步执行结果的反馈，从领域知识库中检索相关信息。
 * @input {GraphState} state - 从 `state.stepResult.output.userFeedback` 获取用户反馈, 从 `state.runningConfig.knowledgeVDBService` 获取知识库服务。
 * @output {Partial<GraphState>} - 将检索到的文档更新到 `state.replanState.knowledge.retrievedDomainDocs`。
 */
export async function retrieveNode(
	state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
	console.log('---REPLAN NODE: RETRIEVE KNOWLEDGE---');
	const { stepResult, runningConfig, userId } = state;

	if (!stepResult?.output.userFeedback) {
		console.log('No user feedback provided, skipping retrieval.');
		return {};
	}
	if (!runningConfig?.knowledgeVDBService) {
		throw new Error('KnowledgeVDBService not found in runningConfig');
	}
	if (!userId) throw new Error('User ID is not set');

	const retrievedDomainDocs = await runningConfig.knowledgeVDBService.retrieveCodeAndDoc_CRAG(
		stepResult.output.userFeedback,
		10,
		userId
	);
	console.log(`Retrieved domain documents with user feedback: ${retrievedDomainDocs}`);

	return {
		replanState: {
			...state.replanState,
			knowledge: {
				retrievedDomainDocs
			}
		}
	};
}

/**
 * Replan - Code Get Node
 * @description 根据上一步执行结果中记录的已修改/创建的文件列表，读取这些文件的最新内容。
 * @input {GraphState} state - 从 `state.stepResult.output.writtenCodeFiles` 获取文件列表, 从 `state.projectPath` 获取项目根路径。
 * @output {Partial<GraphState>} - 将读取到的文件内容和路径更新到 `state.replanState.projectCodes`。
 */
export async function codeGetNode(
	state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
	console.log('---REPLAN NODE: GET MODIFIED CODE---');
	const { stepResult, projectPath } = state;

	if (!stepResult?.output.writtenCodeFiles || stepResult.output.writtenCodeFiles.length === 0) {
		console.log('No written code files recorded, skipping code retrieval.');
		return {};
	}
	if (!projectPath) {
		throw new Error('Project path not found in state.');
	}

	const projectCodes = await Promise.all(
		stepResult.output.writtenCodeFiles.map(async file => {
			const fullPath = path.join(projectPath, file.relativePath);
			try {
				const content = await fs.readFile(fullPath, 'utf-8');
				return {
					relativePath: file.relativePath,
					content: content,
					summary: file.summary
				};
			} catch (error) {
				console.error(`Error reading file ${fullPath}:`, error);
				return {
					relativePath: file.relativePath,
					content: `Error reading file: ${(error as Error).message}`,
					summary: file.summary
				};
			}
		})
	);

	console.log(`Retrieved content for ${projectCodes.length} code files.`);
	return {
		replanState: {
			...state.replanState,
			projectCodes: projectCodes
		}
	};
}

/**
 * 准备反思内容的图节点 (For Replan)
 * @description 汇总和格式化所有用于反思的上下文信息。
 * @input {GraphState} state - 从 state 中获取原始计划, 步骤执行结果, 以及新获取的代码。
 * @output {Partial<GraphState>} - 更新 `state.reflectIO.input` 以便 `reflect` 节点可以使用。
 */
export async function prepareReflection(
	state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
	console.log('---REPLAN NODE: PREPARE REFLECTION---');
	const { plan, stepResult, replanState } = state;

	const context = `
原始计划:
\`\`\`json
${JSON.stringify(plan?.output.implementationPlan, null, 2)}
\`\`\`

上一步执行总结: ${stepResult?.output.summary}

修改/新增的代码:
\`\`\`json
${JSON.stringify(replanState.projectCodes, null, 2)}
\`\`\`
  `;

	return {
		reflectIO: {
			input: {
				content: stepResult?.output.userFeedback ?? '无用户反馈',
				context: context
			},
			output: null // Clear previous reflection output
		}
	};
}

/**
 * 重新分析的图节点 (Re-analyze)
 * @description 调用 re-analysis chain 来根据所有最新信息（包括反思）更新需求分析。
 * @input {GraphState} state - 包含所有需要输入的上下文。
 * @output {Partial<GraphState>} - 更新 `state.plan.output.highlightAnalysis`。
 */
export async function reAnalyze(
	state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
	console.log('---REPLAN NODE: RE-ANALYZE---');
	const {
		projectInfo,
		lightSpot,
		plan: originalPlan,
		stepResult,
		replanState,
		reflection,
		runningConfig
	} = state;

	if (!runningConfig?.reAnalysisChain) {
		throw new Error('reAnalysisChain not found in runningConfig');
	}
	if (!originalPlan) {
		throw new Error('Original plan is not set in state for re-analysis');
	}
	if (!projectInfo) {
		throw new Error('Project info is not set in state for re-analysis');
	}

	const { highlightAnalysis } = await runningConfig.reAnalysisChain.invoke({
		projectInfo,
		lightSpot,
		originalPlan,
		stepResult,
		knowledge: {
			retrievedProjectCodes: '', // 在replan中我们更依赖领域知识和代码
			retrievedDomainDocs: replanState.knowledge.retrievedDomainDocs
		},
		reflection: reflection ?? undefined
	});

	console.log('---RE-ANALYSIS OUTPUT---', highlightAnalysis);

	return {
		plan: {
			...originalPlan,
			output: {
				...originalPlan.output,
				highlightAnalysis: highlightAnalysis
			}
		}
	};
}

/**
 * 重新规划的图节点 (Re-plan)
 * @description 调用 re-plan chain 来根据更新后的需求分析生成一个全新的剩余步骤计划。
 * @input {GraphState} state - 包含所有需要输入的上下文。
 * @output {Partial<GraphState>} - 更新 `state.plan.output.implementationPlan` 和 `state.humanIO.output`。
 */
export async function rePlan(
	state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
	console.log('---REPLAN NODE: RE-PLAN---');
	const {
		projectInfo,
		lightSpot,
		plan: currentPlan,
		stepResult,
		replanState,
		reflection,
		runningConfig
	} = state;

	if (!runningConfig?.rePlanChain) {
		throw new Error('rePlanChain not found in runningConfig');
	}
	if (!currentPlan) {
		throw new Error('Current plan is not set in state for re-planning');
	}
	if (!projectInfo) {
		throw new Error('Project info is not set in state for re-planning');
	}

	const { implementationPlan } = await runningConfig.rePlanChain.invoke({
		projectInfo,
		lightSpot,
		highlightAnalysis: currentPlan.output.highlightAnalysis,
		originalPlan: currentPlan,
		stepResult,
		knowledge: {
			retrievedProjectCodes: '',
			retrievedDomainDocs: replanState.knowledge.retrievedDomainDocs
		},
		reflection: reflection ?? undefined
	});

	console.log('---RE-PLAN OUTPUT---', implementationPlan);

	const newPlan: Plan = {
		output: {
			highlightAnalysis: currentPlan.output.highlightAnalysis,
			implementationPlan: implementationPlan
		}
	};

	return {
		plan: newPlan,
		humanIO: {
			...state.humanIO,
			output: {
				type: ReviewType.PLAN,
				content: JSON.stringify(newPlan, null, 2)
			}
		}
	};
}

// ----- 图 -----
export const ReplanGraph = new StateGraph(GraphState)
	.addNode('retrieve', retrieveNode)
	.addNode('get_code', codeGetNode)
	.addNode('upload_code', uploadCode)
	.addNode('prepare_reflection', prepareReflection)
	.addNode('reflect', reflect)
	.addNode('re_analyze', reAnalyze)
	.addNode('re_plan', rePlan)
	.addNode('human_review', waitForHumanReview)
	.addNode('reset_step_index', (state: typeof GraphState.State) => {
		return {
			currentStepIndex: 0
		};
	});

ReplanGraph
	//根据`userFeedback`检索知识
	.addEdge(START, 'retrieve')
	//根据`writtenCodeFiles`获取所有修改或新增的代码
	.addEdge('retrieve', 'get_code')
	//更新目标项目代码知识库：删了重建
	.addEdge('get_code', 'upload_code')
	//准备反思
	.addEdge('upload_code', 'prepare_reflection')
	//`反思Agent`：根据`userFeedback、summary、projectCodes`反思`originalPlan`即亮点实现计划，得到`Reflection`
	.addEdge('prepare_reflection', 'reflect')
	//根据`input、knowledge、Reflection`，更新亮点的需求分析
	.addEdge('reflect', 're_analyze')
	//根据`input、knowledge、projectCodes、Reflection、亮点的需求分析`，更新亮点的实现计划
	.addEdge('re_analyze', 're_plan')
	//`人类审核`：根据`亮点的需求分析、亮点的实现计划`，审核是否需要重新反思或结束
	.addEdge('re_plan', 'human_review')
	.addConditionalEdges('human_review', shouldReflect, {
		prepare_reflection: 'prepare_reflection', // 如果提供了反馈，则再次反思。
		reset_step_index: 'reset_step_index'
	})
	//重置步骤索引
	.addEdge('reset_step_index', END);
