import { CRAGGraph } from './node_edge_graph';

async function main() {
  const inputs = {
    question: 'Explain how the different types of agent memory work.',
  };
  const config = { recursionLimit: 50 };
  let finalState;
  for await (const output of await CRAGGraph.stream(inputs, config)) {
    for (const [key, value] of Object.entries(output)) {
      console.log(`\n---\nNode: '${key}'`);
      // 可选：在每个节点记录完整状态
      // console.log(JSON.stringify(value, null, 2));
      finalState = value;
    }
  }

  // 记录最终的生成结果。
  console.log('\n--- Final Generation ---');
  console.log(finalState.generation);
  console.log('---');
}

main();