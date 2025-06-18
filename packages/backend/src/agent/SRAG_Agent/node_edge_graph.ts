import { DocumentInterface } from "@langchain/core/documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { RunnableConfig } from "@langchain/core/runnables";
import { END, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { pull } from "langchain/hub";
import { formatDocumentsAsString } from "langchain/util/document";
import { z } from "zod";
import { retriever } from "../RAG_Agent/retriever";
import { GraphState } from "./state";

// 定义LLM一次。我们将在整个图中使用它。
const model = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
});

//--------------------------------Nodes--------------------------------

/**
 * 检索文档
 *
 * @param {typeof GraphState.State} state 图的当前状态。
 * @param {RunnableConfig | undefined} config 用于跟踪的配置对象。
 * @returns {Promise<Partial<typeof GraphState.State>>} 新的状态对象。
 */
async function retrieve(
  state: typeof GraphState.State,
  config?: RunnableConfig
): Promise<Partial<typeof GraphState.State>> {
  console.log("---RETRIEVE---");

  const documents = await retriever
    .withConfig({ runName: "FetchRelevantDocuments" })
    .invoke(state.question, config);

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

  // 引入提示
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

  // 给数据打标签
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

  // 构建链
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const betterQuestion = await chain.invoke({ question: state.question });

  return {
    question: betterQuestion,
  };
}
/**
 * 确定生成是否基于文档。
 *
 * @param {typeof GraphState.State} state 图的当前状态。
 * @param {RunnableConfig | undefined} config 用于跟踪的配置对象。
 * @returns {Promise<Partial<typeof GraphState.State>>} 新的状态对象。
 */
async function generateGenerationVDocumentsGrade(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---GENERATE GENERATION vs DOCUMENTS GRADE---");

  const llmWithTool = model.withStructuredOutput(
    z
      .object({
        binaryScore: z
          .enum(["yes", "no"])
          .describe("相关性评分 'yes' 或 'no'"),
      })
      .describe(
        "对检索到的文档与答案的相关性进行评分。'yes' 或 'no'。"
      ),
    {
      name: "grade",
    }
  );

  const prompt = ChatPromptTemplate.fromTemplate(
    `您是一位评估员，正在评估一个答案是否基于一组事实/受其支持。
  以下是事实：
  \n ------- \n
  {documents} 
  \n ------- \n
  这是答案：{generation}
  给出一个"yes"或"no"的二元分数，以表示答案是否基于一组事实/受其支持。`
  );

  const chain = prompt.pipe(llmWithTool);

  const score = await chain.invoke({
    documents: formatDocumentsAsString(state.documents),
    generation: state.generation,
  });

  return {
    generationVDocumentsGrade: score.binaryScore,
  };
}

//--------------------------------Edges--------------------------------

/**条件边
 * 决定是生成答案还是重新生成问题。
 *
 * @param {typeof GraphState.State} state 图的当前状态。
 * @returns {"transformQuery" | "generate"} 下一个要调用的节点
 */
function decideToGenerate(state: typeof GraphState.State) {
  console.log("---DECIDE TO GENERATE---");

  const filteredDocs = state.documents;
  if (filteredDocs.length === 0) {
    // 所有文档都已被 checkRelevance 舍弃
    // 我们将重新生成一个新查询
    console.log("---DECISION: TRANSFORM QUERY---");
    return "transformQuery";
  }

  // 我们有相关的文档，所以生成答案
  console.log("---DECISION: GENERATE---");
  return "generate";
}

/**条件边
 * 决定是继续还是重新生成。
 *
 * @param {typeof GraphState.State} state 图的当前状态。
 * @returns {"supported" | "not supported"} 下一个要调用的节点
 */
function gradeGenerationVDocuments(state: typeof GraphState.State) {
  console.log("---GRADE GENERATION vs DOCUMENTS---");

  const grade = state.generationVDocumentsGrade;
  if (grade === "yes") {
    console.log("---DECISION: SUPPORTED, MOVE TO FINAL GRADE---");
    return "supported";
  }

  console.log("---DECISION: NOT SUPPORTED, GENERATE AGAIN---");
  return "not supported";
}

/**条件边
 * 确定生成是否解决了问题。
 *
 * @param {typeof GraphState.State} state 图的当前状态。
 * @param {RunnableConfig | undefined} config 用于跟踪的配置对象。
 * @returns {Promise<Partial<typeof GraphState.State>>} 新的状态对象。
 */
async function generateGenerationVQuestionGrade(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---GENERATE GENERATION vs QUESTION GRADE---");

  const llmWithTool = model.withStructuredOutput(
    z
      .object({
        binaryScore: z
          .enum(["yes", "no"])
          .describe("相关性评分 'yes' 或 'no'"),
      })
      .describe("对生成是否与问题相关进行评分。'yes' 或 'no'。"),
    {
      name: "grade",
    }
  );

  const prompt = ChatPromptTemplate.fromTemplate(
    `您是一位评估员，正在评估一个答案是否有助于解决一个问题。
  这是答案：
  \n ------- \n
  {generation} 
  \n ------- \n
  这是问题：{question}
  给出一个"yes"或"no"的二元分数，以表示答案是否有助于解决问题。`
  );

  const chain = prompt.pipe(llmWithTool);

  const score = await chain.invoke({
    question: state.question,
    generation: state.generation,
  });

  return {
    generationVQuestionGrade: score.binaryScore,
  };
}

/**条件边
 * 确定生成是否解决了问题。
 *
 * @param {typeof GraphState.State} state 图的当前状态。
 * @returns {"useful" | "not useful"} 下一个要调用的节点
 */
function gradeGenerationVQuestion(state: typeof GraphState.State) {
  console.log("---GRADE GENERATION vs QUESTION---");

  const grade = state.generationVQuestionGrade;
  if (grade === "yes") {
    console.log("---DECISION: USEFUL---");
    return "useful";
  }

  console.log("---DECISION: NOT USEFUL---");
  return "not useful";
}

//--------------------------------Graph--------------------------------
const workflow = new StateGraph(GraphState)
  // 定义节点
  .addNode("retrieve", retrieve)
  .addNode("gradeDocuments", gradeDocuments)
  .addNode("generate", generate)
  .addNode(
    "generateGenerationVDocumentsGrade",
    generateGenerationVDocumentsGrade
  )
  .addNode("transformQuery", transformQuery)
  .addNode(
    "generateGenerationVQuestionGrade",
    generateGenerationVQuestionGrade
  );

// 构建图
workflow.addEdge(START, "retrieve");
workflow.addEdge("retrieve", "gradeDocuments");
workflow.addConditionalEdges("gradeDocuments", decideToGenerate, {
  transformQuery: "transformQuery",
  generate: "generate",
});
workflow.addEdge("transformQuery", "retrieve");
workflow.addEdge("generate", "generateGenerationVDocumentsGrade");
workflow.addConditionalEdges(
  "generateGenerationVDocumentsGrade",
  gradeGenerationVDocuments,
  {
    supported: "generateGenerationVQuestionGrade",
    "not supported": "generate",
  }
);

workflow.addConditionalEdges(
  "generateGenerationVQuestionGrade",
  gradeGenerationVQuestion,
  {
    useful: END,
    "not useful": "transformQuery",
  }
);

// 编译
export const app = workflow.compile();