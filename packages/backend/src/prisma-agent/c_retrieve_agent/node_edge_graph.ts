import { SerpAPI } from '@langchain/community/tools/serpapi';

import { Document, DocumentInterface } from '@langchain/core/documents';
import { END, START, StateGraph } from '@langchain/langgraph';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { GraphState } from './state';

// --- 节点 (Nodes) ---
/**
 * 配置 检索评估器 chain
 */

/**
 * **节点1: 检索 (Retrieve)**
 * @description 从向量数据库中检索与问题相关的文档。
 * @param {typeof GraphState.State} state - 图的当前状态。
 * @returns {Promise<Partial<typeof GraphState.State>>} - 包含检索到的文档的新状态。
 */
export async function retrieve(
	state: typeof GraphState.State,
	config: any
): Promise<Partial<typeof GraphState.State>> {
	console.log('---CRAG NODE: RETRIEVE---');
	try {
		const retriever = config.configurable.retriever;
		const documents = await retriever.invoke(state.question);
		return { documents };
	} catch (error) {
		console.error('检索失败,将返回空文档:', error);
		return { documents: [] };
	}
}

/**
 * **节点2: 评估检索结果 (Grade Retrieval)**
 * @description 评估每个检索到的文档的相关性，并确定总体检索状态。
 * @param {typeof GraphState.State} state - 图的当前状态。
 * @returns {Promise<Partial<typeof GraphState.State>>} - 包含评分和检索状态的新状态。
 */
export async function gradeRetrieval(
	state: typeof GraphState.State,
	config: any
): Promise<Partial<typeof GraphState.State>> {
	console.log('---CRAG NODE: GRADE RETRIEVAL---');
	const { question, documents } = state;
	const retrievalGraderChain = config.configurable.retrievalGraderChain;
	let totalScore = 0;

	for (const doc of documents) {
		const grade = await retrievalGraderChain.invoke({
			question,
			context: doc.pageContent
		});
		doc.metadata.relevance_score = grade.score; // 将分数存入元数据
		totalScore += grade.score;
		console.log(`  - Doc score: ${grade.score}`);
	}

	const averageScore = totalScore / (documents.length || 1);
	let retrieval_status: 'Correct' | 'Incorrect' | 'Ambiguous';

	if (averageScore >= config.configurable.UPPER_THRESHOLD) {
		retrieval_status = 'Correct';
		console.log('---GRADE: CORRECT---');
	} else if (averageScore < config.configurable.LOWER_THRESHOLD) {
		retrieval_status = 'Incorrect';
		console.log('---GRADE: INCORRECT---');
	} else {
		retrieval_status = 'Ambiguous';
		console.log('---GRADE: AMBIGUOUS---');
	}

	return { documents, retrieval_status };
}

/**
 * **节点3: 知识精炼 (Refine Knowledge)**
 * @description 对判定为"Correct"或"Ambiguous"的文档进行分解-过滤-重组，提取关键信息。
 * @param {typeof GraphState.State} state - 图的当前状态。
 * @returns {Promise<Partial<typeof GraphState.State>>} - 包含精炼后文档的新状态。
 */
export async function refineKnowledge(
	state: typeof GraphState.State,
	config: any
): Promise<Partial<typeof GraphState.State>> {
	console.log('---CRAG NODE: REFINE KNOWLEDGE---');
	const { question, documents } = state;
	const retrievalGraderChain = config.configurable.retrievalGraderChain;

	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: 200,
		chunkOverlap: 20,
		//尽可能保留句子完整性
		separators: ['\n\n', '\n', '. ', '。', '? ', '! ', '？', '！']
	});

	const refinedDocs: DocumentInterface[] = [];
	// 只处理评分较高的文档
	const relevantDocs = documents.filter(
		doc => doc.metadata.relevance_score >= config.configurable.LOWER_THRESHOLD
	);

	for (const doc of relevantDocs) {
		const splits = await splitter.splitDocuments([doc]);
		for (const split of splits) {
			const grade = await retrievalGraderChain.invoke({
				question,
				context: split.pageContent
			});
			// 只保留高度相关的知识片段
			if (grade.score >= config.configurable.UPPER_THRESHOLD) {
				console.log('  - Keeping refined chunk.');
				refinedDocs.push(split);
			} else {
				console.log('  - Discarding refined chunk.');
			}
		}
	}

	return { documents: refinedDocs };
}

/**
 * **节点4: Web搜索 (Web Search)**
 * @description 当内部知识不足时，重写查询并执行网络搜索。
 * @param {typeof GraphState.State} state - 图的当前状态。
 * @returns {Promise<Partial<typeof GraphState.State>>} - 包含Web搜索结果的新状态。
 */
export async function webSearch(
	state: typeof GraphState.State,
	config: any
): Promise<Partial<typeof GraphState.State>> {
	console.log('---CRAG NODE: WEB SEARCH---');
	const { question, documents, retrieval_status } = state;
	const rewriteChain = config.configurable.rewriteChain;

	// 1. 重写查询以适应搜索引擎
	console.log('  - Rewriting query for web search...');
	const rewriteResult = await rewriteChain!.invoke({ question });
	const webQuery = rewriteResult.rewrittenQuery;
	console.log(`  - Web query: ${webQuery}`);

	// 2. 执行Web搜索
	console.log('  - Searching web...');
	const searchTool = new SerpAPI(process.env.SERPAPI_API_KEY);
	const searchResult = await searchTool.invoke(webQuery);
	const webDocs = [new Document({ pageContent: searchResult })];

	// 根据检索状态决定是替换还是合并文档
	if (retrieval_status === 'Incorrect') {
		console.log('  - Replacing documents with web results.');
		return { documents: webDocs };
	} else {
		// 'Ambiguous' 状态
		console.log('  - Appending web results to existing documents.');
		return { documents: documents.concat(webDocs) };
	}
}

/**
 * **节点5: 评估和精炼Web文档 (Grade and Refine Web)**
 * @description 对来自Web的文档进行评估和精炼。它只处理没有评分的文档。
 * @param {typeof GraphState.State} state - 图的当前状态。
 * @returns {Promise<Partial<typeof GraphState.State>>} - 包含最终文档集的新状态。
 */
export async function gradeAndRefineWeb(
	state: typeof GraphState.State,
	config: any
): Promise<Partial<typeof GraphState.State>> {
	console.log('---CRAG NODE: GRADE AND REFINE WEB---');
	const { question, documents } = state;
	const retrievalGraderChain = config.configurable.retrievalGraderChain;

	const docsToProcess = documents.filter(d => d.metadata.relevance_score === undefined);
	const existingDocs = documents.filter(d => d.metadata.relevance_score !== undefined);

	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: 200,
		chunkOverlap: 20,
		separators: ['\n\n', '\n', '. ', '。', '? ', '! ', '？', '！']
	});

	const refinedWebDocs: DocumentInterface[] = [];
	for (const doc of docsToProcess) {
		const splits = await splitter.splitDocuments([doc]);
		for (const split of splits) {
			const grade = await retrievalGraderChain.invoke({
				question,
				context: split.pageContent
			});
			if (grade.score >= config.configurable.UPPER_THRESHOLD) {
				console.log('  - Keeping web chunk.');
				refinedWebDocs.push(split);
			} else {
				console.log('  - Discarding web chunk.');
			}
		}
	}

	const finalDocs = existingDocs.concat(refinedWebDocs);
	return { documents: finalDocs };
}

// --- 边 (Edges) ---

/**
 * **条件边1: 决定检索后的下一步**
 * @description 根据`retrieval_status`决定是直接生成、进行Web搜索还是知识精炼。
 * @param {typeof GraphState.State} state - 图的当前状态。
 * @returns {"refineKnowledge" | "webSearch"} - 下一个节点的名称。
 */
export function decideAction(state: typeof GraphState.State) {
	console.log('---CRAG EDGE: DECIDE ACTION---');
	const status = state.retrieval_status;
	if (status === 'Incorrect') {
		return 'webSearch';
	}
	return 'refineKnowledge';
}

/**
 * **条件边2: 决定精炼后的下一步**
 * @description 在知识精炼后，检查是否需要补充Web搜索（针对"Ambiguous"状态）。
 * @param {typeof GraphState.State} state - 图的当前状态。
 * @returns {"webSearch" | "generate"} - 下一个节点的名称。
 */
export function decideAfterRefinement(state: typeof GraphState.State) {
	console.log('---CRAG EDGE: DECIDE AFTER REFINEMENT---');
	const status = state.retrieval_status;
	if (status === 'Ambiguous') {
		return 'webSearch';
	}
	// "Correct" 状态
	return 'generate';
}

//--- 图 (Graph) ---
const CRAGGraph = new StateGraph(GraphState)
	.addNode('retrieve', retrieve)
	.addNode('gradeRetrieval', gradeRetrieval)
	.addNode('refineKnowledge', refineKnowledge)
	.addNode('webSearch', webSearch)
	.addNode('gradeAndRefineWeb', gradeAndRefineWeb);

CRAGGraph.addEdge(START, 'retrieve');
CRAGGraph.addEdge('retrieve', 'gradeRetrieval');
CRAGGraph.addConditionalEdges('retrieve', (state: typeof GraphState.State) => {
	if (state.documents.length === 0) {
		return END;
	}
	return 'gradeRetrieval';
});
CRAGGraph.addConditionalEdges('gradeRetrieval', decideAction);
CRAGGraph.addConditionalEdges('refineKnowledge', decideAfterRefinement);
CRAGGraph.addEdge('webSearch', 'gradeAndRefineWeb');
CRAGGraph.addEdge('gradeAndRefineWeb', END);

export { CRAGGraph };
