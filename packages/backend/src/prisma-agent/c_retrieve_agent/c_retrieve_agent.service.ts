import { ChatOpenAI } from "@langchain/openai";
import { Injectable } from "@nestjs/common";
import { formatDocumentsAsString } from "langchain/util/document";
import { ModelService } from "../../model/model.service";
import { KnowledgeIndex, KnowledgeVDBService } from "../data_base/konwledge_vdb.service";
import { CRAGGraph } from "./node_edge_graph";
/**
 * 按CRAG Agent的思路，检索知识库，并返回评估、精炼、网络搜索补充后的文档
 * @description 实现：去掉CRAG Agent的生成节点
 * @param {string} question - 用户的问题
 * @returns {Promise<string>} - 返回评估、精炼、网络搜索补充后的文档
 */
@Injectable()
export class CRetrieveAgentService  {

  private workflow: (typeof CRAGGraph.compile) extends (...args: any[]) => infer T ? T : never;

  constructor(private readonly modelService: ModelService,
    private readonly knowledgeVDBService: KnowledgeVDBService,
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
  async invoke(question: string,prefix: KnowledgeIndex, userId: string, topK: number) {
    const retriever = await this.knowledgeVDBService.getRetriever(prefix, userId, topK);
    const model = this.modelService.getLLMDeepSeekRaw('deepseek-chat') as ChatOpenAI;
    const result = await this.workflow.invoke({ question,runningConfig:{
      retriever,
      model,
      UPPER_THRESHOLD:7,
      LOWER_THRESHOLD:3,
    } });
    return formatDocumentsAsString(result.documents);
  }
}