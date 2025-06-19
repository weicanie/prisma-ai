import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { tools } from "./tools";

const agentExecutor = createReactAgent({
  llm: new ChatOpenAI({ model: "gpt-4o" }),
  tools: tools,
});
export { agentExecutor };

