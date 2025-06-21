import { JsonOutputToolsParser } from "@langchain/core/output_parsers/openai_tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

//--------------------------------Planner--------------------------------
const plan = zodToJsonSchema(
  z.object({
    steps: z
      .array(z.string())
      .describe("不同的步骤，应该按顺序排列"),
  }),
);
const planFunction = {
  name: "plan",
  description: "这个工具用于规划要遵循的步骤",
  parameters: plan,
};

const planTool = {
  type: "function",
  function: planFunction,
};
const plannerPrompt = ChatPromptTemplate.fromTemplate(
  `对于给定的目标，想出一个简单的一步一步的计划。
这个计划应该包括单独的任务，如果执行正确就会得到正确的答案。不要添加任何多余的步骤。
最后一步的结果应该是最终的答案。确保每一步都有所有需要的信息——不要跳过任何步骤。

目标：{objective}`,
);

const model = new ChatOpenAI({
  modelName: "gpt-4o",
}).withStructuredOutput(planFunction);

const planner = plannerPrompt.pipe(model);

//--------------------------------RePlanner--------------------------------

const response = zodToJsonSchema(
  z.object({
    response: z.string().describe("Response to user."),
  }),
);

const responseTool = {
  type: "function",
  function: {
    name: "response",
    description: "Response to user.",
    parameters: response,
  },
};

const replannerPrompt = ChatPromptTemplate.fromTemplate(
`对于给定的目标，想出一个简单的一步一步的计划。
这个计划应该包括单独的任务，如果执行正确就会得到正确的答案。不要添加任何多余的步骤。
最后一步的结果应该是最终的答案。确保每一步都有所有需要的信息——不要跳过任何步骤。

你的目标是：
{input}

你的原始计划：
{plan}

你目前已经完成了以下步骤：
{pastSteps}

更新你的计划。如果没有更多的步骤需要完成，并且你可以返回给用户，那么就使用'response'函数返回。
否则，完成计划。
只向计划中添加仍然需要完成的步骤。不要返回已经完成的步骤作为计划的一部分。`,
);

const parser = new JsonOutputToolsParser();
const replanner = replannerPrompt
  .pipe(
    new ChatOpenAI({ model: "gpt-4o" }).bindTools([
      planTool,
      responseTool,
    ]),
  )
  .pipe(parser);

export { planner, replanner };

