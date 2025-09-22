import { Injectable } from '@nestjs/common';
import { KnowledgeVDBService } from '../../prisma-agent/data_base/konwledge_vdb.service';

/**
 * 项目deepWiki知识库服务。
 * 功能：将项目deepwiki网站内容转换为项目知识库。
 * @method downloadDeepWiki: 将项目deepwiki网站转换为md保存到本地
 * @method uploadDeepWikiToKnowledgeBase: 将本地md上传到知识库
 */
@Injectable()
export class ProjectDeepWikiService {
	constructor(private knowledgeVDBService: KnowledgeVDBService) {}

	async downloadDeepWiki(wikiUrl: string) {}

	async uploadDeepWikiToKnowledgeBase(wikiUrl: string) {}
}
