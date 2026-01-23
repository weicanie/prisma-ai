import { Observable } from 'rxjs';
import z from 'zod';
import { StreamingChunk } from '../sse';

/**
 * 亮点实现前端上传的Dto
 */
export interface ImplementDto {
	projectId: string;
	lightspot: string;
	projectPath: string; // 项目文件夹在用户目录中的名字，应为github仓库名称（也应为项目数据的name字段）
}

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
	RE_PLAN = 're_plan', // 重新计划
	Execute_Step = 'execute_step' // 执行步骤
}
export enum InterruptType {
	HumanReview = 'human_review',
	ExecuteStep = 'execute_step'
}
/**
 * @description agent中断时返回的数据
 */
export interface InterruptData {
	content: string;
	type: InterruptType;
	reviewType: ReviewType;
}
/**
 * @description 前端长轮询时返回的数据
 */
export interface StageResult extends Partial<InterruptData> {
	done: boolean; // 整个执行是否完成
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
 * @description 用户review后反馈的Zod Schema。
 */
export const humanInputSchema = z.object({
	action: userActionSchema,
	content: z.string().describe('当 action 为 redo 时，这里是具体的反馈内容。')
});

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
 * 用户上传的反馈，用于恢复agent执行。
 */
export interface RecoverDto {
	runId: string;
	feedback: z.infer<typeof humanInputSchema> | z.infer<typeof resultStepSchema>;
	fixedContent?: string | Record<any, any>;
}

/**
 * agent服务维护特定runId的agent内部的`当前结果流`
 */
export interface SsePipeStatusMap {
	[runId: string]: {
		hasUndoneStream: boolean; // 是否有未完成的Stream，即前端没有完整接收的Stream，应该最多只有一个
		curStream: Observable<StreamingChunk> | null; // 当前pipe的数据源即llm返回的stream
		interruptType?: InterruptType; // 流结束后agent因何中断，默认HumanReview
	};
}
