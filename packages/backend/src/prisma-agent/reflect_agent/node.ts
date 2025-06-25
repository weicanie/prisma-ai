import { GraphState } from '../state';

/**
 * @description 执行反思的图节点。
 * 该节点调用反思Chain来评估输入内容，并将结果同时更新到 reflectIO.output 和顶层的 reflection 通道。
 * @input {GraphState} state - 从 state.reflectIO.input 中获取需要反思的内容和上下文。它还从 state.runningConfig.reflectChain 获取chain。
 * @output {Partial<GraphState>} - 更新后的状态，包含 reflectIO.output 和顶层 reflection 的反思结果。
 */
export async function reflect(
	state: typeof GraphState.State,
	config: any
): Promise<Partial<typeof GraphState.State>> {
	const { input } = state.reflectIO;
	const reflectChain = config.configurable?.reflectChain;
	if (!reflectChain) {
		throw new Error('Reflect chain not found in configurable');
	}

	console.log('---Reflect NODE: REFLECT---');
	const reflection = await reflectChain.invoke({
		content: input.content,
		context: input.context ?? '无'
	});
	console.log('---REFLECTION---', reflection);
	return {
		reflectIO: {
			...state.reflectIO,
			output: reflection
		},
		reflection: reflection
	};
}
