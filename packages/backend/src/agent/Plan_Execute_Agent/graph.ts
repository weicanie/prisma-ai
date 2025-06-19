import { HumanMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { agentExecutor } from "./executor";
import { planner, replanner } from "./planner";

const PlanExecuteState = Annotation.Root({
  //用户输入
  input: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
  }),
  //当前计划（待执行的步骤）
  plan: Annotation<string[]>({
    reducer: (x, y) => y ?? x ?? [],
  }),
  //历史步骤（已执行的步骤及其结果）
  pastSteps: Annotation<[string, string][]>({
    reducer: (x, y) => x.concat(y),
  }),
  //最终输出
  response: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
})

async function executeStep(
  state: typeof PlanExecuteState.State,
  config?: RunnableConfig,
): Promise<Partial<typeof PlanExecuteState.State>> {
  const task = state.plan[0];
  const input = {
    messages: [new HumanMessage(task)],
  };
  const { messages } = await agentExecutor.invoke(input, config);

  return {
    pastSteps: [[task, messages[messages.length - 1].content.toString()]],
    plan: state.plan.slice(1),
  };
}

async function planStep(
  state: typeof PlanExecuteState.State,
): Promise<Partial<typeof PlanExecuteState.State>> {
  const plan = await planner.invoke({ objective: state.input });
  return { plan: plan.steps };
}

async function replanStep(
  state: typeof PlanExecuteState.State,
): Promise<Partial<typeof PlanExecuteState.State>> {
  const output:any = await replanner.invoke({
    input: state.input,
    plan: state.plan.join("\n"),
    pastSteps: state.pastSteps
      .map(([step, result]) => `${step}: ${result}`)
      .join("\n"),
  });
  const toolCall = output[0];

  if (toolCall.type == "response") {
    return { response: toolCall.args?.response };
  }

  return { plan: toolCall.args?.steps };
}

function shouldEnd(state: typeof PlanExecuteState.State) {
  return state.response ? "true" : "false";
}

const workflow = new StateGraph(PlanExecuteState)
  .addNode("planner", planStep)
  .addNode("agent", executeStep)
  .addNode("replan", replanStep)
  .addEdge(START, "planner")
  .addEdge("planner", "agent")
  .addEdge("agent", "replan")
  .addConditionalEdges("replan", shouldEnd, {
    true: END,
    false: "agent",
  });

export const PlanExecuteGraph = workflow.compile();