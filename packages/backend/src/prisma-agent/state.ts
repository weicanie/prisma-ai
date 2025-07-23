import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { ProjectDto } from '@prisma-ai/shared';
import {
	HumanInput,
	HumanOutput,
	Knowledge,
	Plan,
	Plan_step,
	Reflection,
	ReflectIOState,
	Replan,
	Result_step
} from './types';
/* 
  用于记录对话历史
  新消息自动push, 自动管理消息id
  会自动将[role,content]消息包装为Message对象
*/
const messageState = MessagesAnnotation;

const InputState = Annotation.Root({
	/**
	 * @description 目标项目信息。
	 * @lifecycle - 在工作流启动时由外部传入，并且在整个流程中保持不变。
	 */
	projectInfo: Annotation<ProjectDto | null>({
		reducer: (_x, y) => y ?? null,
		default: () => null
	}),
	/**
	 * @description 本次任务要实现的"亮点"或功能描述。
	 * @lifecycle - 在工作流启动时由外部传入，并且在整个流程中保持不变。
	 */
	lightSpot: Annotation<string>({
		reducer: (_x, y) => y ?? '',
		default: () => ''
	}),

	/**
	 * @description 目标项目路径。
	 * @lifecycle - 在工作流启动时由外部传入，并且在整个流程中保持不变。在ProjectCodeVDBService中用于读取并上传项目代码。
	 */
	projectPath: Annotation<string>({
		reducer: (_x, y) => y ?? '',
		default: () => ''
	}),

	/**
	 * @description 当前用户ID
	 * @lifecycle - 在工作流启动时由外部传入，并且在整个流程中保持不变。
	 */
	userId: Annotation<string>({
		reducer: (_x, y) => y ?? '',
		default: () => ''
	}),

	/**
	 * @description 当前会话ID
	 * @lifecycle - 在工作流启动时由外部传入，并且在整个流程中保持不变。
	 */
	sessionId: Annotation<string>({
		reducer: (_x, y) => y ?? '',
		default: () => ''
	})
});

const PlanState = Annotation.Root({
	/**
	 * @description 亮点的整体实现计划（高阶计划）。
	 * @lifecycle - 由 `plan_execute` 子图生成和完善。
	 *            - 在 `analyze` 节点中初步创建（包含分析）。
	 *            - 在 `plan` 节点中完善（包含步骤）。
	 */
	plan: Annotation<Plan | null>({
		reducer: (_x, y) => y ?? null,
		default: () => null
	}),
	/**
	 * @description 当前正在处理的单个步骤的详细计划。
	 * @lifecycle - 由 `plan_step` 子图在每次迭代时生成和完善。
	 *            - 在 `analyze_step` 节点中创建。
	 *            - 在 `plan_step` 节点中完善。
	 *            - 每次进入 `plan_step` 子图时都会被重置。
	 */
	stepPlan: Annotation<Plan_step | null>({
		reducer: (_x, y) => y ?? null,
		default: () => null
	}),
	/** 现在的replan不保留之前的步骤,因此总为0,和直接shift一样
	 * @description 标记当前执行到高阶计划中的第几个步骤。
	 * @lifecycle - 初始为 0。
	 */
	currentStepIndex: Annotation<number>({
		reducer: (_x, y) => y ?? 0,
		default: () => 0
	}),
	/**
	 * @description 当前步骤的执行结果，由开发者提供。
	 * @lifecycle - 在 `execute_step` 节点中通过 `interrupt` 等待外部传入。
	 */
	stepResult: Annotation<Result_step | null>({
		reducer: (_x, y) => y ?? null,
		default: () => null
	}),
	/**
	 * @description 所有步骤的执行结果，由开发者提供。
	 * @lifecycle - 在 `execute_step` 节点中通过 `interrupt` 等待外部传入。
	 */
	stepResultList: Annotation<Result_step[]>({
		reducer: (x, y) => (y ? x.concat(y) : x),
		default: () => []
	}),
	/**
	 * @description Replan子图中使用的数据通道。
	 * @lifecycle - 在replan流程中被填充和使用。
	 */
	replanState: Annotation<Replan>({
		reducer: (x, y) => (y ? { ...x, ...y } : x),
		default: () => ({
			projectCodes: [],
			knowledge: {
				retrievedDomainDocs: ''
			}
		})
	}),
	/**
	 * @description 检索到的相关知识，用于辅助分析和规划。
	 * @lifecycle - 在 `retrieveNode` 节点中被填充。
	 *            - 在 `analyze` 和 `plan` 节点中被消耗。
	 */
	knowledge: Annotation<Knowledge>({
		reducer: (x, y) => (y ? { ...x, ...y } : x),
		default: () => ({ retrievedProjectCodes: '', retrievedDomainDocs: '' })
	}),
	/**
	 * @description 最终生成的、给开发者的完整Prompt。
	 * @lifecycle - 在 `generateFinalPromptNode` 节点中被生成和填充。
	 *            - 在 `writePromptToFileNode` 节点中被读取并写入文件。
	 */
	finalPrompt: Annotation<string>({
		reducer: (_x, y) => y ?? '',
		default: () => ''
	})
});

const SubAgentState = Annotation.Root({
	/**
	 * @description 用户交互Agent的IO通道。
	 * @lifecycle - `output` 在各个 `analyze` 和 `plan` 节点中被写入。
	 *            - `input` 在 `human_review` 节点被中断后，由外部调用时写入。
	 *            - `reviewPath` 在 `human_review` 节点被中断后，由外部调用时写入。用于获取用户fix修改后的内容。
	 */
	humanIO: Annotation<{
		input: HumanInput | null;
		output: HumanOutput | null;
		reviewPath: string | null;
	}>({
		reducer: (x, y) => {
			// console.log('humanIO reducer', x, y);
			return y ? { ...x, ...y } : x;
		},
		default: () => ({ input: null, output: null, reviewPath: null })
	}),
	/**
	 * @description 反思Agent的IO通道。
	 * @lifecycle - `input` 在 `prepare_reflection` 节点中被写入。
	 *            - `output` 在 `reflect` 节点中被写入。
	 */
	reflectIO: Annotation<ReflectIOState>({
		reducer: (x, y) => (y ? { ...x, ...y } : x),
		default: () => ({ input: { content: '', context: '' }, output: null })
	}),
	/**
	 * @description 反思Agent的输出，作为一个独立的通道，方便规划Agent直接消费。
	 * @lifecycle - 在 `reflect` 节点中被写入。
	 *            - 在 `analyze`/`plan` 节点中被读取，并在读取后立即清空。
	 */
	reflection: Annotation<Reflection | null>({
		reducer: (_x, y) => y ?? null,
		default: () => null
	})
});

const ControlState = Annotation.Root({
	/**
	 * @description 标记整个流程是否结束。
	 * @lifecycle - 在 `execute_step` 的条件边中可以被设置为 `true` 以便提前终止流程。
	 */
	done: Annotation<boolean>({
		reducer: (_x, y) => y ?? false,
		default: () => false
	})
});

/**
 * @description 整个Agent系统的统一状态定义。
 * 使用 `Annotation.Root` 来创建一个类型化的状态图，确保所有节点和边之间数据传递的类型安全。
 * 每个字段都使用 `Annotation<T>` 进行定义，并可以指定 `reducer` 和 `default` 值。
 */
export const GraphState = Annotation.Root({
	// --- Inputs ---
	...InputState.spec,
	// --- Planning_Execution ---
	...PlanState.spec,
	// --- Sub-agents ---
	...SubAgentState.spec,
	// --- Control ---
	...ControlState.spec,
	// --- History ---
	// LangGraph内置的消息历史状态，可用于记录和传递对话消息。
	...messageState.spec
});
