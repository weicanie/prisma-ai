import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createRetrieverTool } from "langchain/tools/retriever";
import { retriever } from "./retriever";
import { GraphState } from "./state";
const tool = createRetrieverTool(
  retriever,
  {
    name: "retrieve_blog_posts",
    description:
      "搜索并返回关于Lilian Weng的LLM座席、提示工程和对LLM的对抗性攻击的博客文章信息。",
  },
);
export const tools = [tool];

export const toolNode = new ToolNode<typeof GraphState.State>(tools);
