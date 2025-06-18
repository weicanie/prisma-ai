import { app } from "./node_edge_graph";

async function main() {
const inputs = {
  question: "Explain how the different types of agent memory work.",
};
const config = { recursionLimit: 50 };

const prettifyOutput = (output: Record<string, any>) => {
  const key = Object.keys(output)[0];
  const value = output[key];
  console.log(`Node: '${key}'`);
  if (key === "retrieve" && "documents" in value) {
    console.log(`Retrieved ${value.documents.length} documents.`);
  } else if (key === "gradeDocuments" && "documents" in value) {
    console.log(`Graded documents. Found ${value.documents.length} relevant document(s).`);
  } else {
    console.dir(value, { depth: null });
  }
}

for await (const output of await app.stream(inputs, config)) {
  prettifyOutput(output);
    console.log("\n---ITERATION END---\n");
  }
}

main();