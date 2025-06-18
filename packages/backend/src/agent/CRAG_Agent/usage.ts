import { app } from "./node_edge_graph";
async function main() {
  const inputs = {
    question: "Explain how the different types of agent memory work.",
  };
  const config = { recursionLimit: 50 };
  let finalGeneration;
  for await (const output of await app.stream(inputs, config)) {
    for (const [key, value] of Object.entries(output)) {
      console.log(`Node: '${key}'`);
      // 可选：在每个节点记录完整状态
      // console.log(JSON.stringify(value, null, 2));
      finalGeneration = value;
    }
    console.log("\n---\n");
  }

  // 记录最终的生成结果。
  console.log(JSON.stringify(finalGeneration, null, 2));
}

main();