import { RunnableConfig, type Runnable } from '@langchain/core/runnables';
import { Logger } from '@nestjs/common';
import { UserInfoFromToken, type ProjectDto } from '@prisma-ai/shared';
import { z } from 'zod';
import { EventBusService } from '../../EventBus/event-bus.service';
import { type CRetrieveAgentService } from './c_retrieve_agent/c_retrieve_agent.service';
import { type KnowledgeVDBService } from './data_base/konwledge_vdb.service';
import { type ProjectCodeVDBService } from './data_base/project_code_vdb.service';
import { type PlanExecuteAgentService } from './plan_execute_agent/plan_execute_agent.service';
import { type PlanStepAgentService } from './plan_step_agent/plan_step_agent.service';
import { type ReflectAgentService } from './reflect_agent/reflect_agent.service';
/**
 * @description 反思的结构化输出Zod Schema
 */
export const reflectionSchema = z.object({
	evaluation: z.string().describe('对输入内容的总体评价'),
	critique: z.string().describe('具体的批评，指出哪些地方做得不好或不应该做'),
	advice: z.string().describe('具体的改进建议，指出应该如何修改或应该做什么')
});
type ChainReturned<T extends (...args: any) => Runnable> = T extends (...args: any) => infer R
	? R
	: never;

// --- Running Config ---
/**
 * @description 图在运行时需要的配置，通过State传入，以解耦图的定义和服务的实现。
 */
export interface RunningConfig {
	//需求分析Chain
	analysisChain: ChainReturned<PlanExecuteAgentService['createAnalysisChain']>;
	//计划Chain
	planChain: ChainReturned<PlanExecuteAgentService['createPlanChain']>;
	//重新分析Chain
	reAnalysisChain: ChainReturned<PlanExecuteAgentService['createReAnalysisChain']>;
	//重新计划Chain
	rePlanChain: ChainReturned<PlanExecuteAgentService['createRePlanChain']>;
	//步骤分析Chain
	stepAnalysisChain: ChainReturned<PlanStepAgentService['createAnalysisChain']>;
	//步骤计划Chain
	stepPlanChain: ChainReturned<PlanStepAgentService['createPlanChain']>;
	//最终PromptChain
	finalPromptChain: ChainReturned<PlanStepAgentService['createFinalPromptChain']>;
	//反思Chain
	reflectChain: ChainReturned<ReflectAgentService['createReflectChain']>;

	//知识库服务
	knowledgeVDBService: KnowledgeVDBService;
	//项目代码库服务
	projectCodeVDBService: ProjectCodeVDBService;
	//CRAG检索Agent服务
	cRetrieveAgentService: CRetrieveAgentService;
	//事件总线服务
	eventBusService: EventBusService;
	logger: Logger;
	userId: string;
	userInfo: UserInfoFromToken;
}

export interface NodeConfig extends RunnableConfig {
	configurable: RunningConfig;
}

// --- Shared Types ---
/**
 * @description 反思的结果。由 ReflectAgent 生成，并被 Plan-Execute 和 Plan-Step agents 用作改进其输出的依据。
 * @lifecycle - 在 `reflect` 节点中生成，并写入 `reflection` 状态通道。
 *            - 在 `analyze`, `plan`, `analyze_step`, `plan_step` 节点中作为可选输入被消耗。
 *            - 消耗后即被清空 (设置为 null)。
 */
export type Reflection = z.infer<typeof reflectionSchema>;

/**
 * @description 从向量数据库中检索到的知识内容。
 */
export interface Knowledge {
	retrievedProjectCodes: string;
	retrievedDomainDocs: string;
}

// --- Human Involve Agent Types ---
/**
 * @description 人机交互状态的通用接口（当前未直接在GraphState中使用，但定义了概念）。
 */
export interface HumanIOState<I = string, O = string> {
	/**
	 * @description Agent提供给用户以供审查的内容。
	 */
	output: O;
	/**
	 * @description 用户提供的输入/反馈。
	 */
	input: I;
}
/**
 * @description 用户在审核时可能采取的操作。
 */
export enum UserAction {
	/* 
	- accept：完全接受并继续
	- fix：手动修改并继续
	- redo：反馈并重做
	*/
	ACCEPT = 'accept',
	FIX = 'fix',
	REDO = 'redo'
}

/**
 * @description 用户在审核时可能采取的操作的Zod Schema。
 */
export const userActionSchema = z.nativeEnum(UserAction);

/**
 * @description 用户输入的Zod Schema。
 */
export const humanInputSchema = z.object({
	action: userActionSchema,
	content: z.string().describe('当 action 为 redo 时，这里是具体的反馈内容。')
});

/**
 * @description 用户输入的结构。
 * @lifecycle - 在 `human_review` 节点中，当图被 `interrupt` 后，由外部调用注入。
 *            - 在 `shouldReflect` 条件边中被读取，以决定工作流的走向。
 */
export type HumanInput = z.infer<typeof humanInputSchema>;

/**
 * @description 需要人类审核的内容类型。
 * 这也用于在多轮审核中区分当前所处的阶段。
 */
export enum ReviewType {
	PLAN = 'plan', // 整个高阶计划
	ANALYSIS = 'analysis', // 高阶需求分析
	PLAN_STEP = 'plan_step', // 单个步骤的详细计划
	ANALYSIS_STEP = 'analysis_step', // 单个步骤的详细分析
	RE_ANALYSIS = 're_analysis', // 重新分析
	RE_PLAN = 're_plan' // 重新计划
}
/**
 * @description Agent准备好让用户审核的输出。
 * @lifecycle - 在 `analyze`, `plan`, `analyze_step`, `plan_step` 节点中生成，并写入 `humanIO.output`。
 *            - 在 `human_review` 节点中被读取，用于写入文件并中断流程。
 */
export interface HumanOutput {
	type: ReviewType;
	content: string;
}

// --- Reflect Agent Types ---
/**
 * @description 反思Agent的输入输出状态。
 */
export interface ReflectIOState {
	/**
	 * @description 提供给反思Agent的输入。
	 */
	input: {
		content: string; // 用户反馈
		context: string; // 相关上下文
	};
	/**
	 * @description 反思Agent的输出。
	 */
	output: Reflection | null;
}

// --- Plan Execute Agent Types ---
/**
 * @description 高阶计划的完整结构。
 * @lifecycle - 在 `analyze` 节点中创建，并填充 `highlightAnalysis`。
 *            - 在 `plan` 节点中更新，并填充 `implementationPlan`。
 *            - 作为 `plan_step` 子图的主要输入之一。
 */
export interface Plan {
	output: {
		highlightAnalysis: string; // 需求分析结果
		implementationPlan: Step[]; // 实现步骤清单
	};
}

// --- Plan Step Agent Types ---
/**
 * @description (Unused) 步骤输入的定义
 */
export interface Input_step {
	input: {
		projectInfo: ProjectDto | null;
		totalPlan: Plan;
	};
	knowledge: {
		retrievedProjectCodes: string;
		retrievedDomainDocs: string;
	};
}
/**
 * @description 定义一个计划步骤的结构。
 */
export interface Step {
	stepDescription: string; // 步骤的详细描述
	techStackList: string[]; // 该步骤需要使用的技术清单
	challengesList: string[]; // 该步骤可能遇到的难点清单
	questionsList: string[]; // 关于该步骤存在的疑问清单
}
/**
 * @description 经过细化和澄清后的步骤结构，用于最终生成给开发者的Prompt。
 */
export interface Step_prompt {
	stepDescription: string;
	techStackList: string[];
	challengesSolutionList: string[]; // 针对难点的解决思路
	questionsClarificationList: string[]; // 针对疑问的澄清说明
}
/**
 * @description 单个步骤的详细计划。
 * @lifecycle - 在 `analyze_step` 节点中创建，并填充 `stepAnalysis`。
 *            - 在 `plan_step` 节点中更新，并填充 `implementationPlan`。
 *            - 在 `execute_step` 节点中被读取，并中断以等待开发者执行。
 */
export interface Plan_step {
	output: {
		stepAnalysis: string; // 步骤的详细分析
		implementationPlan: Step[]; // 实现该步骤的子步骤清单
	};
	knowledge: {
		retrievedProjectCodes: string;
		retrievedDomainDocs: string;
	};
}

/**
 * @description 开发者执行完一个步骤后的结果的Zod Schema。
 */
export const resultStepSchema = z.object({
	stepDescription: z.string().describe('步骤的详细描述').optional(),
	output: z
		.object({
			userFeedback: z.string().describe('用户的反馈'),
			writtenCodeFiles: z
				.array(
					z.object({
						relativePath: z.string().describe('新建或修改的文件的相对路径'),
						summary: z.string().describe('对该文件修改的简要总结')
					})
				)
				.describe('开发者编写或修改的文件列表'),
			summary: z.string().describe('对本次执行的总体总结')
		})
		.describe('执行的产出')
});

/**
 * @description 开发者执行完一个步骤后的结果。
 * @lifecycle - 在 `execute_step` 节点中，当图被 `interrupt` 后，由外部调用注入。
 */
export type Result_step = z.infer<typeof resultStepSchema>;

/**
 * @description Replan子图中使用的数据通道。
 */
export interface Replan {
	/**
	 * @member projectCodes 项目代码修改情况
	 */
	projectCodes: {
		relativePath: string; //代码文件路径
		content: string; //代码文件内容
		summary: string; //代码文件修改总结
	}[];
	/**
	 * @description 按`用户反馈`召回的`领域知识块`
	 */
	knowledge: {
		retrievedDomainDocs: string;
	};
}
