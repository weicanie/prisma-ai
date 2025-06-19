import { DocumentInterface } from "@langchain/core/documents";
import { RunnableSequence } from "@langchain/core/runnables";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import z from "zod";
import { retrievalGraderSchema } from "./node_edge_graph";

// 表示我们图的状态。
export const GraphState = Annotation.Root({
  /**
   * 用户的原始问题
   */
  question: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
  }),
  /**
   * 从向量数据库检索到的文档。
   * 会在图的执行过程中被纠正和优化。
   */
  documents: Annotation<DocumentInterface[]>({
    reducer: (x, y) => y ?? x ?? [],
  }),
  /**
   * 最终生成的答案。
   */
  generation: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  /**
   * 检索评估器的判断结果，用于决定下一步的走向。
   * 'Correct': 文档质量高。
   * 'Incorrect': 文档质量低，需要网络搜索。
   * 'Ambiguous': 文档质量中等，需要同时使用内部知识和网络搜索。
   */
  retrieval_status: Annotation<'Correct' | 'Incorrect' | 'Ambiguous'>({
    reducer: (x, y) => y ?? x,
  }),
  /**
   * 配置
   */
  runningConfig: Annotation<{
    model: ChatOpenAI,
    retrievalGraderChain?: RunnableSequence<{context:string,question:string},z.infer<typeof retrievalGraderSchema>>|null,
    retriever:VectorStoreRetriever|null,
    UPPER_THRESHOLD: number,
    LOWER_THRESHOLD: number,
  }>({
    //只读
    reducer: (x, y) => {console.warn("runningConfig is read-only"); return x},
    default: () => ({
      model: new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
      }),
      retrievalGraderChain: null,
      retriever: null,
      UPPER_THRESHOLD: 7,
      LOWER_THRESHOLD: 3,
    }),
  }),
});

//繁琐,因此直接在state中定义只读通道作为配置
/* const ConfigurableAnnotation = Annotation.Root({
  model: Annotation<ChatOpenAI>,
  UPPER_THRESHOLD: Annotation<number>,
  LOWER_THRESHOLD: Annotation<number>,
}); */