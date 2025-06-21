import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { formatDocumentsAsString } from 'langchain/util/document';
import z from 'zod';
import { ModelService } from '../../model/model.service';
import { KnowledgeIndex, KnowledgeVDBService } from '../data_base/konwledge_vdb.service';
import { CRAGGraph } from './node_edge_graph';

export const retrievalGraderSchema = z
	.object({
		score: z
			.number()
			.min(1)
			.max(10)
			.describe('文档与问题的相关性评分，1表示不相关，10表示非常相关。'),
		justification: z.string().describe('评分的简要理由。')
	})
	.describe('对检索到的文档与问题的相关性进行评分的工具。');

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
		private readonly knowledgeVDBService: KnowledgeVDBService
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
	async invoke(question: string, prefix: KnowledgeIndex, userId: string, topK: number) {
		const retriever = await this.knowledgeVDBService.getRetriever(prefix, userId, topK);
		const model = this.modelService.getLLMDeepSeekRaw('deepseek-chat') as ChatOpenAI;
		const result = await this.workflow.invoke({
			question,
			runningConfig: {
				retrievalGraderChain: this.retrievalGraderChain(),
				retriever,
				model,
				UPPER_THRESHOLD: 7,
				LOWER_THRESHOLD: 3
			}
		});
		return formatDocumentsAsString(result.documents);
	}

	/**
	 * 检索结果评估 chain
	 */
	retrievalGraderChain() {
		const model = this.modelService.getLLMDeepSeekRaw('deepseek-chat');

		const retrievalGrader = model.withStructuredOutput(retrievalGraderSchema, {
			name: 'retrieval_grader'
		});

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
`
		);
		/**
		 * 检索评估器，用于评估检索到的文档与问题的相关性。
		 * @description 使用LLM来为每个文档打分(1-10)，并提供理由。
		 */
		const retrievalGraderChain = gradePrompt.pipe(retrievalGrader) as RunnableSequence<
			{ context: string; question: string },
			z.infer<typeof retrievalGraderSchema>
		>;
		return retrievalGraderChain;
	}
}
