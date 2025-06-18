import { HumanMessage } from "@langchain/core/messages";
import { app } from "./node_edge_graph";

async function main() {
  const inputs = {
    messages: [
      new HumanMessage(
        "What are the types of agent memory based on Lilian Weng's blog post?",
      ),
    ],
  };
  let finalState;
  for await (const output of await app.stream(inputs)) {
    for (const [key, value] of Object.entries(output)) {
      const lastMsg = output[key].messages[output[key].messages.length - 1];
      console.log(`Output from node: '${key}'`);
      console.dir({
        type: lastMsg._getType(),
        content: lastMsg.content,
        tool_calls: lastMsg.tool_calls,
      }, { depth: null });
      console.log("---\n");
      finalState = value;
    }
  }
  
  console.log(JSON.stringify(finalState, null, 2));
}
main()