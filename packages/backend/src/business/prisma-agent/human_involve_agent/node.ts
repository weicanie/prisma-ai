import { interrupt } from '@langchain/langgraph';
import { Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
// import { InterruptType } from '../prisma-agent.service';
import { GraphState } from '../state';
import { HumanInput, HumanOutput, NodeConfig, ReviewType } from '../types';
export enum InterruptType {
	HumanReview = 'human_review',
	ExecuteStep = 'execute_step'
}

export class HumanInvolve {
	private readonly logger = new Logger(HumanInvolve.name);
	private readonly outputDir = path.resolve(process.cwd(), 'agent_output');

	constructor() {
		// Ensure the output directory exists
		fs.mkdir(this.outputDir, { recursive: true }).catch(error => {
			this.logger.error('Failed to create agent_output directory', error);
		});
	}

	/**
	 * 等待人类审核的图节点。
	 * 该节点首先将待审核内容写入文件，然后使用 `interrupt` 暂停图的执行，等待外部（用户）通过API等方式提供反馈。
	 * @input {GraphState} state - 从 state.humanIO.output 获取需要审核的内容类型和具体内容。
	 * @output {Partial<GraphState>} - 将用户的输入（通过 interrupt 注入）更新到 state.humanIO.input 中。
	 */
	async waitForHumanReview(
		state: typeof GraphState.State,
		config: NodeConfig
	): Promise<Partial<typeof GraphState.State>> {
		this.logger.log('---节点: 等待人类评审---');
		const { type: reviewType, content } = state.humanIO.output as HumanOutput;

		// 1. 将 review 内容写入文件
		const outputPath = await this.writeReviewFile(reviewType, content);
		this.logger.log(`待评审内容已写入文件: ${outputPath}. 等待用户输入...`);

		// 2. 中断流程，等待用户输入
		const userInput: HumanInput = interrupt({
			content,
			outputPath,
			type: InterruptType.HumanReview,
			reviewType: reviewType
		});

		this.logger.log('---人类输入已接收---', userInput);

		// 3. 将用户输入更新到 state
		return {
			humanIO: {
				...state.humanIO,
				input: userInput,
				reviewPath: outputPath
			}
		};
	}

	private getFilePath(reviewType: ReviewType): string {
		switch (reviewType) {
			case ReviewType.PLAN:
			case ReviewType.RE_PLAN:
				return path.join(this.outputDir, 'plan.json');
			case ReviewType.ANALYSIS:
			case ReviewType.RE_ANALYSIS:
				return path.join(this.outputDir, 'analysis.md');
			case ReviewType.PLAN_STEP:
				return path.join(this.outputDir, 'plan_step.json');
			case ReviewType.ANALYSIS_STEP:
				return path.join(this.outputDir, 'analysis_step.md');
			default:
				throw new Error(`Unsupported review type: ${reviewType}`);
		}
	}

	/**
	 * 将需要用户 review 的内容写入指定文件
	 * @param reviewType 要 review 的内容类型，决定了写入哪个文件（如 plan.json, analysis.md 等）。
	 * @param content 要写入文件的字符串内容。
	 * @returns {Promise<string>} - 返回写入文件的绝对路径。
	 */
	private async writeReviewFile(reviewType: ReviewType, content: string): Promise<string> {
		const filePath = this.getFilePath(reviewType);
		try {
			// 使用 fs/promises 异步写入
			await fs.writeFile(filePath, content, { encoding: 'utf-8' });
			return filePath;
		} catch (error) {
			this.logger.error(`Failed to write to ${filePath}`, error);
			throw error;
		}
	}
}

const humanInvolve = new HumanInvolve();
// 等待人类审核的图节点
export const waitForHumanReview = humanInvolve.waitForHumanReview.bind(humanInvolve);
