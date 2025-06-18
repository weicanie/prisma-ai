import { type DocumentInterface } from "@langchain/core/documents";
import { Annotation } from "@langchain/langgraph";

// 表示我们图的状态。
export const GraphState = Annotation.Root({
  // 检索到的文档,不相关文档被舍弃
  documents: Annotation<DocumentInterface[]>({
    reducer: (x, y) => y ?? x ?? [],
  }),
  //用户的问题
  question: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
  }),
  //当前的生成
  generation: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  // 生成是否与问题相关（对问题有帮助）
  generationVQuestionGrade: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  // 生成是否与文档相关（由文档支撑）
  generationVDocumentsGrade: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
});