import { GraphState } from '../state';
import { NodeConfig } from '../types';
import { chainStreamExecutor } from '../utils/stream';

/**
 * @description 执行反思的图节点。
 * 该节点调用反思Chain来评估输入内容，并将结果同时更新到 reflectIO.output 和顶层的 reflection 通道。
 * @input {GraphState} state - 从 state.reflectIO.input 中获取需要反思的内容和上下文。它还从 state.runningConfig.reflectChain 获取chain。
 * @output {Partial<GraphState>} - 更新后的状态，包含 reflectIO.output 和顶层 reflection 的反思结果。
 */
export async function reflect(
	state: typeof GraphState.State,
	config: NodeConfig
): Promise<Partial<typeof GraphState.State>> {
	const { input } = state.reflectIO;
	const reflectChain = config.configurable?.reflectChain;
	if (!reflectChain) {
		throw new Error('Reflect chain not found in configurable');
	}

	config.configurable.logger.log('---节点: 反思---');
	const reflection = await chainStreamExecutor(
		config.configurable.runId,
		reflectChain,
		{
			content: input.content,
			context: input.context ?? '无'
		},
		config.configurable.manageCurStream
	);

	config.configurable.logger.log('---反思结果---', reflection);
	return {
		reflectIO: {
			...state.reflectIO,
			output: reflection
		},
		reflection: reflection
	};
}
