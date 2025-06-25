import { AIMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { END, START, StateGraph } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { pull } from 'langchain/hub';
import { z } from 'zod';
import { GraphState } from './state';
import { toolNode, tools } from './tools';

enum Node {
	RETRIEVE = 'retrieve',
	CHECK_RELEVANCE = 'check_relevance',
	AGENT = 'agent',
	REWRITE = 'rewrite',
	GENERATE = 'generate'
}
// --------------------------------Edges--------------------------------
/**
 * 检查llm是否调用了检索工具,如果调用了,则前往RETRIEVE节点,否则END
 * 决定Agent是否应该检索更多信息或结束流程。
 * 此函数检查状态中的最后一条消息是否包含函数调用。如果存在工具调用，
 * 则流程继续检索信息。否则，它将结束流程。
 * @param {typeof GraphState.State} state - Agent的当前状态，包括所有消息。
 * @returns {string} - "continue"继续检索过程或"end"结束的决定。
 */
function shouldRetrieve(state: typeof GraphState.State): string {
	const { messages } = state;
	console.log('---DECIDE TO RETRIEVE---');
	const lastMessage = messages[messages.length - 1];

	if (
		'tool_calls' in lastMessage &&
		Array.isArray(lastMessage.tool_calls) &&
		lastMessage.tool_calls.length
	) {
		console.log('---DECISION: RETRIEVE---');
		return Node.RETRIEVE;
	}
	// 如果没有工具调用，那么我们完成。
	return END;
}

/**
 * 检查检索到的文档是否和用户提问相关
 * 根据检索到的文档的相关性，确定Agent下一步应该做什么。
 * 然后，它使用预定义的模型和输出解析器评估这些文档与用户
 * 初始问题的相关性。如果文档相关，则认为对话
 * 已完成。否则，将继续检索过程。
 * @param {typeof GraphState.State} state - Agent的当前状态，包括所有消息。
 * @returns {Promise<Partial<typeof GraphState.State>>} - 更新后的状态，并将新消息添加到消息列表中。
 */
async function gradeDocuments(
	state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
	console.log('---GET RELEVANCE---');

	const { messages } = state;
	const tool = {
		name: 'give_relevance_score',
		description: 'Give a relevance score to the retrieved documents.',
		schema: z.object({
			binaryScore: z.string().describe("Relevance score 'yes' or 'no'")
		})
	};

	const prompt = ChatPromptTemplate.fromTemplate(
		`你是一个评分员，负责评估检索到的文档与用户问题的相关性。
  这是检索到的文档:
  \n ------- \n
  {context}
  \n ------- \n
  这是用户的问题: {question}
  如果文档内容与用户问题相关，则将其评为相关。
  给出"yes"或"no"的二进制分数，以指示文档是否与问题相关。
  Yes: 文档与问题相关。
  No: 文档与问题不相关。`
	);

	const model = new ChatOpenAI({
		model: 'gpt-4o',
		temperature: 0
	}).bindTools([tool], {
		tool_choice: tool.name //指定必须调用该工具
	});

	const chain = prompt.pipe(model);

	const lastMessage = messages[messages.length - 1];

	const score = await chain.invoke({
		question: messages[0].content as string,
		context: lastMessage.content as string
	});

	return {
		messages: [score]
	};
}

/**
 * 获取gradeDocuments节点推送的文档相关性检查结果,相关则继续,否则重做检索
 * 此函数检查对话中的最后一条消息是否为FunctionMessage类型，
 * 这表明已执行文档检索。
 * 然后，它检查上一个LLM工具调用的相关性。
 *
 * @param {typeof GraphState.State} state - Agent的当前状态，包括所有消息。
 * @returns {string} - 根据文档的相关性返回"yes"或"no"的指令。
 */
function checkRelevance(state: typeof GraphState.State): string {
	console.log('---CHECK RELEVANCE---');

	const { messages } = state;
	const lastMessage = messages[messages.length - 1];
	if (!('tool_calls' in lastMessage)) {
		throw new Error(
			"The 'checkRelevance' node requires the most recent message to contain tool calls."
		);
	}
	const toolCalls = (lastMessage as AIMessage).tool_calls;
	if (!toolCalls || !toolCalls.length) {
		throw new Error('Last message was not a function message');
	}

	if (toolCalls[0].args.binaryScore === 'yes') {
		console.log('---DECISION: DOCS RELEVANT---');
		return 'yes';
	}
	console.log('---DECISION: DOCS NOT RELEVANT---');
	return 'no';
}

// --------------------------------Nodes--------------------------------

/**
 * 作为agent的llm进行 agent loop ———— 使用 llm原生tool
 * 调用Agent模型以根据当前状态生成响应。
 * 此函数调用Agent模型为当前对话状态生成响应。
 * 响应被添加到状态的消息中。
 * @param {typeof GraphState.State} state - Agent的当前状态，包括所有消息。
 * @returns {Promise<Partial<typeof GraphState.State>>} - 更新后的状态，并将新消息添加到消息列表中。
 */
async function agent(state: typeof GraphState.State): Promise<Partial<typeof GraphState.State>> {
	console.log('---CALL AGENT---');

	const { messages } = state;
	// 找到包含 `give_relevance_score` 工具调用的AIMessage，
	// 如果存在则将其删除。这是因为Agent不需要知道
	// 相关性分数。
	const filteredMessages = messages.filter(message => {
		if (
			'tool_calls' in message &&
			Array.isArray(message.tool_calls) &&
			message.tool_calls.length > 0
		) {
			return message.tool_calls[0].name !== 'give_relevance_score';
		}
		return true;
	});

	const model = new ChatOpenAI({
		model: 'gpt-4o',
		temperature: 0,
		streaming: true
	}).bindTools(tools);

	const response = await model.invoke(filteredMessages);
	return {
		messages: [response]
	};
}

/**
 * 当检索到的文档和用户提问不相关时,重写检索向量
 * 转换查询以生成更好的问题。
 * @param {typeof GraphState.State} state - Agent的当前状态，包括所有消息。
 * @returns {Promise<Partial<typeof GraphState.State>>} - 更新后的状态，并将新消息添加到消息列表中。
 */
async function rewrite(state: typeof GraphState.State): Promise<Partial<typeof GraphState.State>> {
	console.log('---TRANSFORM QUERY---');

	const { messages } = state;
	const question = messages[0].content as string;
	const prompt = ChatPromptTemplate.fromTemplate(
		`查看输入并尝试推断其潜在的语义意图/含义。\n
    这是最初的问题:
    \n ------- \n
    {question}
    \n ------- \n
    提出一个改进的问题:`
	);

	// 评分器
	const model = new ChatOpenAI({
		model: 'gpt-4o',
		temperature: 0,
		streaming: true
	});
	const response = await prompt.pipe(model).invoke({ question });
	return {
		messages: [response]
	};
}

/**
 * 生成答案
 * @param {typeof GraphState.State} state - Agent的当前状态，包括所有消息。
 * @returns {Promise<Partial<typeof GraphState.State>>} - 更新后的状态，并将新消息添加到消息列表中。
 */
async function generate(state: typeof GraphState.State): Promise<Partial<typeof GraphState.State>> {
	console.log('---GENERATE---');

	const { messages } = state;
	const question = messages[0].content as string;
	// 提取最新的ToolMessage
	const lastToolMessage = messages
		.slice()
		.reverse()
		.find(msg => msg._getType() === 'tool');
	if (!lastToolMessage) {
		throw new Error('No tool message found in the conversation history');
	}

	const docs = lastToolMessage.content as string;

	/*
   人类

   你是一个用于问答任务的助手。使用以下检索到的上下文片段来回答问题。如果你不知道答案，就说你不知道。最多使用三个句子，并保持答案简洁。

   问题: {question}

   上下文: {context}

   答案:
  */
	const prompt = await pull<ChatPromptTemplate>('rlm/rag-prompt');

	const llm = new ChatOpenAI({
		model: 'gpt-4o',
		temperature: 0,
		streaming: true
	});

	const ragChain = prompt.pipe(llm);

	const response = await ragChain.invoke({
		context: docs,
		question
	});

	return {
		messages: [response]
	};
}

// --------------------------------Graph--------------------------------
// 定义图
const workflow = new StateGraph(GraphState)
	// 定义我们将在其间循环的节点。
	.addNode('agent', agent)
	.addNode('retrieve', toolNode)
	.addNode('gradeDocuments', gradeDocuments)
	.addNode('rewrite', rewrite)
	.addNode('generate', generate);
// 调用Agent节点来决定是否检索
workflow.addEdge(START, 'agent');

// 决定是否检索
workflow.addConditionalEdges('agent', shouldRetrieve);

workflow.addEdge('retrieve', 'gradeDocuments');

// Edges taken after the `action` node is called.
workflow.addConditionalEdges('gradeDocuments', checkRelevance, {
	yes: 'generate',
	no: 'rewrite'
});

workflow.addEdge('generate', END);
workflow.addEdge('rewrite', 'agent');

// Compile
export const RAGGraph = workflow.compile();
