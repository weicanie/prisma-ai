import { interrupt } from '@langchain/langgraph';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { GraphState } from '../state';
import { HumanInput, HumanOutput, ReviewType } from '../types';

export class HumanInvolve {
	private readonly logger = new Logger(HumanInvolve.name);
	private readonly outputDir = path.resolve(process.cwd(), 'agent_output');

	constructor() {}

	/**
	 * 等待人类审核的图节点。
	 * 该节点首先将待审核内容写入文件，然后使用 `interrupt` 暂停图的执行，等待外部（用户）通过API等方式提供反馈。
	 * @input {GraphState} state - 从 state.humanIO.output 获取需要审核的内容类型和具体内容。
	 * @output {Partial<GraphState>} - 将用户的输入（通过 interrupt 注入）更新到 state.humanIO.input 中。
	 */
	async waitForHumanReview(
		state: typeof GraphState.State
	): Promise<Partial<typeof GraphState.State>> {
		console.log('---NODE: HUMAN REVIEW---');
		const { type, content } = state.humanIO.output as HumanOutput;

		// 1. 将 review 内容写入文件
		await this.writeReviewFile(type, content);
		console.log(`Content for review [${type}] written. Waiting for human input...`);

		// 2. 中断流程，等待用户输入
		const userInput: HumanInput = interrupt({
			type,
			content
		});

		console.log('---HUMAN INPUT RECEIVED---', userInput);

		// 3. 将用户输入更新到 state
		return {
			humanIO: {
				...state.humanIO,
				input: userInput
			}
		};
	}

	private getFilePath(reviewType: ReviewType): string {
		// 确保目录存在
		try {
			if (!fs.existsSync(this.outputDir)) {
				fs.mkdirSync(this.outputDir, { recursive: true });
			}
		} catch (error) {
			this.logger.error('Failed to create agent_output directory', error);
		}
		switch (reviewType) {
			case ReviewType.PLAN:
				return path.join(this.outputDir, 'plan.md');
			case ReviewType.ANALYSIS:
				return path.join(this.outputDir, 'analysis.md');
			case ReviewType.PLAN_STEP:
				return path.join(this.outputDir, 'plan_step.md');
			case ReviewType.ANALYSIS_STEP:
				return path.join(this.outputDir, 'analysis_step.md');
			default:
				throw new Error(`Unsupported review type: ${reviewType}`);
		}
	}

	/**
	 * 将需要用户 review 的内容写入指定文件
	 * @param reviewType 要 review 的内容类型，决定了写入哪个文件（如 plan.md, analysis.md 等）。
	 * @param content 要写入文件的字符串内容。
	 * @input reviewType - 'plan', 'analysis', 'plan_step', or 'analysis_step'.
	 * @input content - The string content to be written to the file.
	 * @output {Promise<void>} - A promise that resolves when the file has been written.
	 */
	private async writeReviewFile(reviewType: ReviewType, content: string): Promise<void> {
		const filePath = this.getFilePath(reviewType);
		try {
			// 覆盖原内容
			fs.unlinkSync(filePath);
			fs.writeFileSync(filePath, content, { encoding: 'utf-8' });
			this.logger.log(`Successfully wrote to ${filePath}`);
		} catch (error) {
			this.logger.error(`Failed to write to ${filePath}`, error);
			throw error;
		}
	}
}

const humanInvolve = new HumanInvolve();
// 等待人类审核的图节点
export const waitForHumanReview = humanInvolve.waitForHumanReview.bind(humanInvolve);
