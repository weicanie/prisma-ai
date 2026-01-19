import { interrupt } from '@langchain/langgraph';
import { Logger } from '@nestjs/common';
import * as path from 'path';
// import { InterruptType } from '../prisma-agent.service';
import { InterruptData, InterruptType } from '../../../type/eventBus';
import { GraphState } from '../state';
import { HumanInput, HumanOutput, NodeConfig } from '../types';
export { InterruptType } from '@/type/eventBus';

export class HumanInvolve {
	private readonly logger = new Logger(HumanInvolve.name);
	private readonly outputDir = path.resolve(process.cwd(), 'agent_output');

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
		const interruptData: InterruptData = {
			content,
			type: InterruptType.HumanReview,
			reviewType: reviewType
		};
		// 中断流程，等待用户输入
		const userInput: HumanInput = interrupt(interruptData);

		this.logger.log('---人类输入已接收---', userInput);

		// 将用户输入更新到 state
		return {
			humanIO: {
				...state.humanIO,
				input: userInput
			}
		};
	}
}

const humanInvolve = new HumanInvolve();
// 等待人类审核的图节点
export const waitForHumanReview = humanInvolve.waitForHumanReview.bind(humanInvolve);
