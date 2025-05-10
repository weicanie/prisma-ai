import { RunnableLambda } from '@langchain/core/runnables';
import { produce } from 'immer';
// import { Graph, StateGraph } from '@langchain/langgraph';
// import type { Runnable } from '@langchain/core/runnables';

// 简易Runnable接口
interface Runnable {
	invoke(input: any, options?: any): Promise<any>;
}

// 定义节点类型
type NodeType = Runnable | Function;

// 条件函数类型
type ConditionFn = (state: any) => string;

// 边映射类型
type EdgeMap = { [key: string]: string };

// 通道配置格式
type ChannelsConfig = Record<string, { value?: any; default?: () => any }>; //配置初始值

/**
 * 简易版StateGraph。
 * 支持添加节点、边和条件边。
 * 状态管理使用直白的对象传递。
 * @example
 * 
 *1. 创建图和初始状态
	const graph = new DiyStateGraph({
		messages: { default: () => [] },
		status: { default: () => 'initial' }
	});

	2. 添加节点（可执行的东西）
	graph.addNode(
		'processWithLLM',
		RunnableLambda.from(async state => {
			console.log('使用LLM处理输入...');
			return {
				messages: [...state.messages, { role: 'assistant', content: '我已分析了您的项目经验' }],
				status: 'processed'
			};
		})
	);

	3. 添加边（执行流程,即串行顺序）
	graph.addEdge('__start__', 'processWithLLM').addConditionalEdges(
		'processWithLLM',
		state => (state.status === 'need_more_info' ? 'more' : 'done'), // state => 目标点对应的key
		//key -> 点
		{
			more: 'processWithLLM',
			done: '__end__'
		}
	);

	4. 编译图（返回'Runnable'对象）
	const app = graph.compile();

	5. 运行图
	const result = await app.invoke({
		messages: [{ role: 'user', content: '我想优化我的简历' }]
	});

 */
export class DiyStateGraph {
	private nodes: Map<string, NodeType> = new Map(); //点名称 -> 点函数或Runnable对象
	private edges: Map<string, string[]> = new Map(); //点名称 -> 目标点名称数组
	private conditionalEdges: Map<string, { conditionFn: ConditionFn; routes: EdgeMap }> = new Map(); // 点名称 -> 路由表（通往其它点）
	private entryPoint: string = '__start__';
	/**
	 * state对象的属性抽象为通道，通道可以有默认值。
	 * 例如：{ channel1: { value: 1, default: () => 2 } }
	 */
	private channels: Record<string, { value?: any; default?: () => any }> = {};

	/**
	 * 创建一个新的状态图
	 * @param channelsConfig 通道配置
	 */
	constructor(channelsConfig: ChannelsConfig) {
		this.channels = channelsConfig;
	}

	/**
	 * 添加节点
	 * @param name 节点名称
	 * @param node 节点函数或Runnable对象
	 * @returns this，用于链式调用
	 */
	addNode(name: string, node: NodeType): DiyStateGraph {
		this.nodes.set(name, node);
		return this;
	}

	/**
	 * 添加从source到target的边
	 * @param source 源节点名称
	 * @param target 目标节点名称
	 * @returns this，用于链式调用
	 */
	addEdge(source: string, target: string): DiyStateGraph {
		if (!this.edges.has(source)) {
			this.edges.set(source, []);
		}
		this.edges.get(source).push(target);
		return this;
	}

	/**
	 * 添加条件边
	 * @param source 源节点名称
	 * @param condition 条件函数，接收状态并返回目标节点的键
	 * @param routes 路由映射，conditionFn返回值 -> 目标节点名称
	 * @returns this，用于链式调用
	 */
	addConditionalEdges(source: string, conditionFn: ConditionFn, routes: EdgeMap): DiyStateGraph {
		this.conditionalEdges.set(source, { conditionFn, routes });
		return this;
	}

	/**
	 * 设置入口点
	 * @param nodeName 入口节点名称
	 * @returns this，用于链式调用
	 */
	setEntryPoint(nodeName: string): DiyStateGraph {
		this.entryPoint = nodeName;
		return this;
	}

	/**
	 * 编译图为Runnable对象
	 * @returns 可执行的Runnable对象
	 */
	compile(): Runnable {
		return new CompiledGraph(
			this.nodes,
			this.edges,
			this.conditionalEdges,
			this.entryPoint,
			this.channels
		);
	}
}

/**
 * 编译后的图，实现了Runnable接口
 */
class CompiledGraph implements Runnable {
	constructor(
		private nodes: Map<string, NodeType>,
		private edges: Map<string, string[]>,
		private conditionalEdges: Map<string, { conditionFn: ConditionFn; routes: EdgeMap }>,
		private entryPoint: string,
		private channelsConfig: ChannelsConfig
	) {}

	/**
	 * 执行图
	 * @param input 输入数据
	 * @param options 选项
	 * @returns 执行结果
	 */
	async invoke(input: any): Promise<any> {
		// 初始化状态
		let state = this.initializeState(input);

		// 记录执行路径(调试用)
		const executionPath: string[] = [];

		// 当前节点，从入口点开始
		let currentNode = this.entryPoint;
		//TODO 目前是把graph跑成chain (node -> nextNode, 不管node有几个nextNode,跑找到的第一个)
		// 执行直到遇到特殊节点__end__或没有下一个节点
		while (currentNode !== '__end__') {
			executionPath.push(currentNode);

			// 获取节点
			const node = this.nodes.get(currentNode);
			if (!node) {
				if (currentNode === '__start__') {
					// 特殊情况：从__start__直接走到entryPoint
					currentNode = this.entryPoint;
					continue;
				}
				throw new Error(`Node '${currentNode}' not found in graph`);
			}

			// 执行节点
			try {
				let result;
				if (typeof node === 'function') {
					result = await node(state);
				} else {
					result = await node.invoke(state);
				}

				state = this.mergeState(state, result);
			} catch (error) {
				console.error(`Error executing node '${currentNode}':`, error);
				throw error;
			}

			// 确定下一个节点
			const nextNode = this.getNextNode(currentNode, state);
			if (!nextNode) {
				break; // 没有下一个节点，结束执行
			}

			currentNode = nextNode;
		}

		// 记录最后一个节点
		if (currentNode === '__end__') {
			executionPath.push(currentNode);
		}
		console.log('graph调用路径:', executionPath);
		return state;
	}

	/**
	 * result的属性（channels）覆盖state的属性（channels）
	 * @description 使用immer支持channels的深层更新（为对象时浅拷贝会出问题）
	 * @description 如果result的属性在state中不存在，则会被忽略
	 * @description 不能加入新channels,所有的channels应该在一开始就全部定义
	 * @returns 当前状态
	 */
	private mergeState(state: any, result: any): any {
		const nextState = produce(state, draft => {
			for (const [key, value] of Object.entries(result)) {
				if (!(key in this.channelsConfig)) {
					// 只更新在channelsConfig中定义的属性
					throw new Error(`Channel '${key}' not found in channelsConfig`);
				} else {
					draft[key] = value;
				}
			}
		});
		return nextState;
	}
	/**
	 * 初始化状态
	 * @param input 输入数据
	 * @returns 初始状态
	 */
	private initializeState(input: any): any {
		const state: Record<string, any> = {};

		// 设置state初始状态
		for (const [channel, config] of Object.entries(this.channelsConfig)) {
			state[channel] = config.default ? config.default() : config.value;
		}
		return this.mergeState(state, input);
	}

	/**
	 * 确定下一个节点
	 * @param currentNode 当前节点
	 * @param state 当前状态
	 * @returns 下一个节点名称或undefined
	 */
	private getNextNode(currentNode: string, state: any): string | undefined {
		// 检查是否有条件边
		if (this.conditionalEdges.has(currentNode)) {
			const { conditionFn, routes } = this.conditionalEdges.get(currentNode)!;
			const routeKey = conditionFn(state);
			return routes[routeKey];
		}

		// 检查是否有普通边
		if (this.edges.has(currentNode)) {
			const nextNodes = this.edges.get(currentNode)!;
			if (nextNodes.length > 0) {
				return nextNodes[0]; // 简化：只取第一个边
			}
		}

		return void 0;
	}
}

/**
 * 将函数转为Runnable对象
 * @param fn 节点函数
 * @returns Runnable对象
 */
export function createNodeFunction(fn: (state: any) => Promise<any> | any): Runnable {
	return RunnableLambda.from(fn);
}
