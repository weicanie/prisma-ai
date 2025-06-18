import { SerpAPI } from "@langchain/community/tools/serpapi";

import { Document, DocumentInterface } from "@langchain/core/documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { END, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { pull } from "langchain/hub";
import { formatDocumentsAsString } from "langchain/util/document";
import { z } from "zod";
import { retriever } from "../RAG_Agent/retriever";
import { GraphState } from "./state";

//--------------------------------Nodes--------------------------------

// 定义LLM一次。我们将在整个图中使用它。
const model = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
});

/**
 * 检索文档
 *
 * @param {typeof GraphState.State} state 图的当前状态。
 * @param {RunnableConfig | undefined} config 用于跟踪的配置对象。
 * @returns {Promise<Partial<typeof GraphState.State>>} 新的状态对象。
 */
async function retrieve(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---RETRIEVE---");

  const documents = await retriever
    .withConfig({ runName: "FetchRelevantDocuments" })
    .invoke(state.question);

  return {
    documents,
  };
}

/**
 * 生成答案
 *
 * @param {typeof GraphState.State} state 图的当前状态。
 * @param {RunnableConfig | undefined} config 用于跟踪的配置对象。
 * @returns {Promise<Partial<typeof GraphState.State>>} 新的状态对象。
 */
async function generate(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---GENERATE---");

  const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");
  // 通过管道连接提示、模型和输出解析器来构建RAG链
  const ragChain = prompt.pipe(model).pipe(new StringOutputParser());

  const generation = await ragChain.invoke({
    context: formatDocumentsAsString(state.documents),
    question: state.question,
  });

  return {
    generation,
  };
}

/**
 * 确定检索到的文档是否与问题相关。
 *
 * @param {typeof GraphState.State} state 图的当前状态。
 * @param {RunnableConfig | undefined} config 用于跟踪的配置对象。
 * @returns {Promise<Partial<typeof GraphState.State>>} 新的状态对象。
 */
async function gradeDocuments(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---CHECK RELEVANCE---");

  // 将名称和模式传递给 `withStructuredOutput`，这将强制模型调用此工具。
  const llmWithTool = model.withStructuredOutput(
    z
      .object({
        binaryScore: z
          .enum(["yes", "no"])
          .describe("相关性评分 'yes' 或 'no'"),
      })
      .describe(
        "对检索到的文档与问题的相关性进行评分。'yes' 或 'no'。"
      ),
    {
      name: "grade",
    }
  );

  const prompt = ChatPromptTemplate.fromTemplate(
    `您是一位评估员，正在评估检索到的文档与用户问题的相关性。
  这是检索到的文档：

  {context}

  这是用户的问题：{question}

  如果文档包含与用户问题相关的关键字或语义，则将其评为相关。
  给出"yes"或"no"的二元分数，以表示文档是否与问题相关。`
  );

  // 链
  const chain = prompt.pipe(llmWithTool);

  const filteredDocs: Array<DocumentInterface> = [];
  for await (const doc of state.documents) {
    const grade = await chain.invoke({
      context: doc.pageContent,
      question: state.question,
    });
    if (grade.binaryScore === "yes") {
      console.log("---GRADE: DOCUMENT RELEVANT---");
      filteredDocs.push(doc);
    } else {
      console.log("---GRADE: DOCUMENT NOT RELEVANT---");
    }
  }

  return {
    documents: filteredDocs,
  };
}

/**
 * 转换查询以产生更好的问题。
 *
 * @param {typeof GraphState.State} state 图的当前状态。
 * @param {RunnableConfig | undefined} config 用于跟踪的配置对象。
 * @returns {Promise<Partial<typeof GraphState.State>>} 新的状态对象。
 */
async function transformQuery(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---TRANSFORM QUERY---");

  // 引入提示
  const prompt = ChatPromptTemplate.fromTemplate(
    `您正在生成一个为语义搜索检索优化的问题。
  查看输入并尝试推断其潜在的语义意图/含义。
  这是最初的问题：
  \n ------- \n
  {question}
  \n ------- \n
  提出一个改进的问题：`
  );

  // 提示
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const betterQuestion = await chain.invoke({ question: state.question });

  return {
    question: betterQuestion,
  };
}

/**
 * 使用SerpAPI根据重新表述的问题进行网络搜索。
 *
 * @param {typeof GraphState.State} state 图的当前状态。
 * @param {RunnableConfig | undefined} config 用于跟踪的配置对象。
 * @returns {Promise<Partial<typeof GraphState.State>>} 新的状态对象。
 */
async function webSearch(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---WEB SEARCH---");

  const tool = new SerpAPI(process.env.SERPAPI_API_KEY);
  const docs = await tool.invoke({ input: state.question });
  const webResults = new Document({ pageContent: docs });
  const newDocuments = state.documents.concat(webResults);

  return {
    documents: newDocuments,
  };
}

//--------------------------------Edges--------------------------------

/**
 * 决定是生成答案还是重新生成问题。
 *
 * @param {typeof GraphState.State} state 图的当前状态。
 * @returns {"transformQuery" | "generate"} 下一个要调用的节点
 */
function decideToGenerate(state: typeof GraphState.State) {
  console.log("---DECIDE TO GENERATE---");

  const filteredDocs = state.documents;
  if (filteredDocs.length === 0) {
    // 所有文档都已通过 checkRelevance 过滤
    // 我们将重新生成一个新查询
    console.log("---DECISION: TRANSFORM QUERY---");
    return "transformQuery";
  }

  // 我们有相关的文档，所以生成答案
  console.log("---DECISION: GENERATE---");
  return "generate";
}

//--------------------------------Graph--------------------------------

const workflow = new StateGraph(GraphState)
  // 定义节点
  .addNode("retrieve", retrieve)
  .addNode("gradeDocuments", gradeDocuments)
  .addNode("generate", generate)
  .addNode("transformQuery", transformQuery)
  .addNode("webSearch", webSearch);

// 构建图
workflow.addEdge(START, "retrieve");
workflow.addEdge("retrieve", "gradeDocuments");
workflow.addConditionalEdges(
  "gradeDocuments",
  decideToGenerate,
);
workflow.addEdge("transformQuery", "webSearch");
workflow.addEdge("webSearch", "generate");
workflow.addEdge("generate", END);

// 编译
export const app = workflow.compile();
