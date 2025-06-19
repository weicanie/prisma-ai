import { DocumentInterface } from "@langchain/core/documents";
import { Annotation } from "@langchain/langgraph";

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
});