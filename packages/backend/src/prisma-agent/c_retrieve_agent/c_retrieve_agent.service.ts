import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { VectorStoreRetriever } from '@langchain/core/vectorstores';
import { ChatOpenAI } from '@langchain/openai';
import { Inject, Injectable } from '@nestjs/common';
import { formatDocumentsAsString } from 'langchain/util/document';
import { ModelService } from '../../model/model.service';
import { WithFormfixChain } from '../../utils/abstract';
import { RubustStructuredOutputParser } from '../../utils/RubustStructuredOutputParser';
import { CRAGGraph } from './node_edge_graph';
import { retrievalGraderSchema, rewriteQuerySchema } from './type';

/**
 * 按CRAG Agent的思路，检索知识库，并返回评估、精炼、网络搜索补充后的文档
 * @description 实现：去掉CRAG Agent的生成节点
 * @param {string} question - 用户的问题
 * @returns {Promise<string>} - 返回评估、精炼、网络搜索补充后的文档
 */
@Injectable()
export class CRetrieveAgentService {
	private workflow: typeof CRAGGraph.compile extends (...args: any[]) => infer T ? T : never;

	constructor(
		private readonly modelService: ModelService,
		@Inject(WithFormfixChain)
		private readonly chainService: WithFormfixChain
	) {
		this.workflow = CRAGGraph.compile();
	}

	/**
	 * 检索知识库，并返回评估、精炼、网络搜索补充后的文档组成的上下文
	 * @param question - 用户的问题
	 * @param prefix - 知识库索引前缀
	 * @param userId - 当前用户的ID
	 * @param topK - 每次检索的召回数量
	 * @returns
	 */
	async invoke(question: string, retriever: VectorStoreRetriever) {
		// const retriever = await this.knowledgeVDBService.getRetriever(prefix, userId, topK);
		const model = this.modelService.getLLMDeepSeekRaw('deepseek-chat') as ChatOpenAI;
		const result = await this.workflow.invoke(
			{
				question
			},
			{
				configurable: {
					retrievalGraderChain: this.retrievalGraderChain(),
					rewriteChain: this.rewriteChain(),
					retriever,
					model,
					UPPER_THRESHOLD: 7,
					LOWER_THRESHOLD: 3
				}
			}
		);
		return formatDocumentsAsString(result.documents);
	}

	/**
	 * 检索结果评估 chain
	 */
	retrievalGraderChain() {
		const model = this.modelService.getLLMDeepSeekRaw('deepseek-chat');
		const parser = RubustStructuredOutputParser.from(retrievalGraderSchema, this.chainService);

		const gradePrompt = ChatPromptTemplate.fromTemplate(
			`您是一位专业的评估员，负责评估检索到的文档与用户问题的相关性。
请仔细阅读以下文档和问题，并给出一个1到10之间的相关性分数。

- **1-3分 (不相关)**: 文档完全没有提到问题的核心概念。
- **4-6分 (部分相关)**: 文档提到了问题的一些关键词，但没有提供直接或有用的答案。
- **7-10分 (高度相关)**: 文档直接、清晰地回答了用户的问题，或者包含了构建答案所需的核心信息。

**检索到的文档:**
\n ------- \n
{context}
\n ------- \n
**用户的问题:** {question}

直接输出JSON对象本身,而不是markdown格式的json块。
比如你应该直接输出"{{"name":"..."}}"而不是"\`\`\`json\n{{"name":"..."}}\n\`\`\`"

{format_instructions}
`
		);
		/**
		 * 检索评估器，用于评估检索到的文档与问题的相关性。
		 * @description 使用LLM来为每个文档打分(1-10)，并提供理由。
		 */
		const retrievalGraderChain = RunnableSequence.from([
			{
				question: (input: { question: string; context: string }) => input.question,
				context: (input: { question: string; context: string }) => input.context,
				format_instructions: () => parser.getFormatInstructions()
			},
			gradePrompt,
			model,

			parser
		]);
		return retrievalGraderChain;
	}

	/**
	 * 查询重写 chain
	 */
	rewriteChain() {
		const model = this.modelService.getLLMDeepSeekRaw('deepseek-chat');
		const parser = RubustStructuredOutputParser.from(rewriteQuerySchema, this.chainService);

		const rewritePrompt = ChatPromptTemplate.fromTemplate(
			`您是一位强大的查询优化助手。您的任务是将给定的用户问题转化为一个简洁、高效、适合搜索引擎的关键词查询。
请分析以下问题，并提供一个最佳的关键词查询。

**用户问题:**
{question}

直接输出JSON对象本身,而不是markdown格式的json块。
比如你应该直接输出"{{"name":"..."}}"而不是"\`\`\`json\n{{"name":"..."}}\n\`\`\`"

{format_instructions}`
		);

		const rewriteChain = RunnableSequence.from([
			{
				question: (input: { question: string }) => input.question,
				format_instructions: () => parser.getFormatInstructions()
			},
			rewritePrompt,
			model,
			parser
		]);
		return rewriteChain;
	}
}
