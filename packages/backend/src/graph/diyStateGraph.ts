import { Runnable, RunnableLambda } from '@langchain/core/runnables';
import { START, StateGraph } from '@langchain/langgraph';
import { produce } from 'immer';
import { AnyZodObject, z, ZodSchema } from 'zod';

/* 
功能拓展1、waitEdge（等待事件边）：

LangGraph 的核心是“有状态的图式链式调用”，支持节点、条件边、状态流转等。
官方 API 支持条件跳转、循环、分支等，但没有内置“等待外部事件/用户响应再继续”的 waitEdge 机制。

结合外部事件系统（ EventBus），支持添加waitEdge
实现workflow“阻塞/暂停”,相关事件触发后继续执行。

功能拓展2、数据库存储支持：自己传入storeStateFn函数,用于储存当前状态到数据库。
注意：超时储存和断点恢复逻辑需要自己实现。

原理：langgraph的StateGraph compile后也是一个Runnable, 可以在此基础上扩展（使用组合,而不是继承,你继承一个试试?）。

功能拓展3、waitEdge简化自定义 tools agent支持并可高度自定义 （用那两个框架是否不需要这么做会自己停留?）
  原理：还有tool要调用时, 停留在当前节点
  没有工具需要调用时, emit 'no_tool'事件,此时直接返回llm调用结果（否则循环处理工具调用）

*/

// 自定义节点类型
type NodeType = Runnable | Function;
// 自定义边映射类型
type EdgeMap = { [key: string]: string };
// 条件边使用的条件函数类型
type ConditionFn = (state: any) => string;

/** 等待边类型
 * @description event: 要等待的 event
 * @description next: event emit后执行的下一个节点的名称
 */
type WaitEdge = { event: string; next: string };

/**
 * 自定义StateGraph。
 * 功能拓展：支持WaitEdge、数据库存储。
 * 简化状态管理：使用直白的js对象作为state（StateGraph的状态管理包上一层）。
 * @description T: state对象的类型
 * @example
 * 
 *1. 创建图和初始状态
	const graph = new DiyStateGraph<typeof stateSchema>(state, stateSchema);// zod schema

	2. 添加节点（Runnable对象或者函数）
	graph.addNode(
		'processWithLLM',
		RunnableLambda.from(async state => {
			console.log('使用LLM处理输入...');
		})
	);

	3. 添加边（普通边、条件边、等待边）
	graph.addEdge('__start__', 'processWithLLM').addWaitEdge(
	'processWithLLM','user_response','Agent'
	).addConditionalEdges(
		'Agent',
		state => (state.status === 'need_more_info' ? 'more' : 'done'), // state => 目标点对应的key
		//key -> 点
		{
			more: 'processWithLLM',
			done: '__end__'
		}
	);

	4. 编译图（返回的也是Runnable对象）
	const app = graph.compile(eventBus);

	5.(可选) 添加数据库存储函数
	graph.setStoreStateFn(async (state, node, progress) => {
	//储存状态到数据库
	})
	6. 运行图
	const result = await app.invoke({
		messages: [{ role: 'user', content: '我想优化我的简历' }]
		//status使用默认值
	});

 */
export class DiyStateGraph<T extends ZodSchema> {
	private waitEdges: Map<string, WaitEdge> = new Map();
	private storeStateFn?: (state: any, node: string, progress?: string) => Promise<void>;
	private channels: z.infer<T>;
	private stateGraph: StateGraph<T, any, any, string>; //中间两any是stategraph里节点的state和输出类型，会根据T（state 定义）自动推导

	constructor(state: z.infer<T>, stateSchema: AnyZodObject) {
		this.channels = state;
		this.stateGraph = new StateGraph(stateSchema);
	}

	addNode(name: string, node: NodeType): this {
		let runnableNode;
		if (typeof node === 'function') {
			// 函数包装成 (input, options?) => ... 形式
			runnableNode = RunnableLambda.from((input: any, options?: any) => node(input));
		} else {
			runnableNode = node;
		}
		this.stateGraph.addNode(name, runnableNode);
		return this;
	}

	addEdge(source: string, target: string): this {
		this.stateGraph.addEdge(source, target);
		return this;
	}

	addConditionalEdges(source: string, conditionFn: ConditionFn, routes: EdgeMap): this {
		this.stateGraph.addConditionalEdges(source, conditionFn, routes);
		return this;
	}

	addWaitEdge(source: string, event: string, target: string): this {
		this.waitEdges.set(source, { event, next: target });
		return this;
	}

	setEntryPoint(nodeName: string): this {
		this.stateGraph.addEdge(START, nodeName);
		return this;
	}

	setStoreStateFn(fn: (state: any, node: string, progress?: string) => Promise<void>): this {
		this.storeStateFn = fn;
		return this;
	}

	compile(eventBus: { on: Function; off: Function }): Runnable {
		const baseRunnable = this.stateGraph.compile();
		return new CompiledGraph<T>(
			baseRunnable,
			this.waitEdges,
			this.channels,
			eventBus,
			this.storeStateFn
		);
	}
}

class CompiledGraph<T extends ZodSchema> extends Runnable {
	static lc_namespace = ['diy', 'graph'];
	get lc_namespace() {
		return ['diy', 'graph'];
	}
	constructor(
		private baseRunnable: Runnable,
		private waitEdges: Map<string, WaitEdge>,
		private channels: z.infer<T>,
		private eventBus: { on: Function; off: Function },
		private storeStateFn?: (state: any, node: string, progress?: string) => Promise<void>
	) {
		super();
	}
	//跑graph
	async invoke(input: any, options?: any): Promise<any> {
		let state = this.channels;

		// 记录执行路径(调试用)
		const executionPath: string[] = [];

		let currentNode = '__start__';

		// 执行直到遇到特殊节点__end__或没有下一个节点
		while (currentNode !== '__end__') {
			executionPath.push(currentNode);

			//* wait边处理
			// 如果当前节点是等待边，流程阻塞,等待事件触发继续执行
			if (this.waitEdges.has(currentNode)) {
				const { event, next } = this.waitEdges.get(currentNode)!;
				await new Promise<void>(resolve => {
					const handler = (...payload: any[]) => {
						this.eventBus!.off(event, handler);
						if (payload[0]) state = this.mergeState(state, payload[0]);
						resolve();
					};
					this.eventBus.on(event, handler);
				});
				currentNode = next;
				continue;
			}
			//普通边和条件边由内部stateGraph处理
			try {
				const result = await this.baseRunnable.invoke(state, options);
				state = this.mergeState(state, result);
			} catch (error) {
				//FIXME 错误应该记录为日志,并提供优雅降级（其它llm调用兜底、让ai说一些话术让用户重试）
				console.error(`Error executing node '${currentNode}':`, error);
				console.log('graph执行错误,', '当前状态:', state, '当前节点:', currentNode);
				throw error;
			}
			if (this.storeStateFn) await this.storeStateFn(state, currentNode, 'end');
			break;
		}
		if (currentNode === '__end__') executionPath.push(currentNode);
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
				if (!(key in (this.channels as object))) {
					// 只更新在channelsConfig中定义的属性
					throw new Error(`Channel '${key}' not found in channelsConfig`);
				} else {
					draft[key] = value;
				}
			}
		});
		return nextState;
	}
}
