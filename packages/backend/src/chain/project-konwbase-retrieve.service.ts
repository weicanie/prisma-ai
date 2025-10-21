import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Injectable } from '@nestjs/common';
import {
	KnowledgeNamespace,
	KnowledgeVDBService
} from '../business/prisma-agent/data_base/konwledge_vdb.service';
import { ProjectCodeVDBService } from '../business/prisma-agent/data_base/project_code_vdb.service';
import { CacheService, L1_DEFAULT_TTL, L2_DEFAULT_TTL } from '../cache/cache.service';
import { asyncMap } from '../utils/awaitMap';
import { BusinessEnum, ProjectProcessingInput } from './project-chain.service';
/**
 * 知识库集成：检索项目（projectDto）相关文档和代码
 */
@Injectable()
export class ProjectKonwbaseRetrieveService {
	constructor(
		private readonly knowledgeVDBService: KnowledgeVDBService,
		private readonly projectCodeVDBService: ProjectCodeVDBService,
		private readonly cacheService: CacheService
	) {}

	async retrievedDomainDocs(i: ProjectProcessingInput, business: BusinessEnum) {
		const project_doc_cache = await this.cacheService.getOrSet(
			this.cacheService.getProjectRetrievedDocKey(i.project.name!, i.userInfo.userId),
			async () => {
				return await this._retrievedDomainDocs(i, business);
			},
			L1_DEFAULT_TTL.LONG,
			L2_DEFAULT_TTL.LONG
		);
		return project_doc_cache;
	}

	/**
	 * 知识库集成：检索项目（projectDto）相关文档
	 */
	async _retrievedDomainDocs(i: ProjectProcessingInput, business: BusinessEnum) {
		try {
			switch (business) {
				case BusinessEnum.lookup:
				case BusinessEnum.polish:
				case BusinessEnum.mine:
				case BusinessEnum.businessLookup:
				case BusinessEnum.businessPaper:
				case BusinessEnum.aichat:
					return `${await this.retrievedDocsFromProjectInfo(i)}\n\n${await this.retrievedDocsFromLightspot(i)}`;
			}
		} catch (e) {
			return '相关文档库检索失败';
		}
	}

	/**
	 * 检索项目信息相关文档
	 */
	async retrievedDocsFromProjectInfo(i: ProjectProcessingInput) {
		const { techStack, desc } = i.project.info;
		const { role, contribute, bgAndTarget } = desc;
		const namespaces = [
			KnowledgeNamespace.PROJECT_DOC_USER,
			KnowledgeNamespace.TECH_DOC,
			KnowledgeNamespace.OTHER,
			KnowledgeNamespace.USER_PROJECT_DEEPWIKI
		];

		const techStackDocsQuery = techStack.join(',');
		const techStackDocs = await this.queryDoc(techStackDocsQuery, i, namespaces);

		const roleDocsQuery = role;
		const roleDocs = await this.queryDoc(roleDocsQuery, i, namespaces);

		const contributeDocsQuery = contribute;
		const contributeDocs = await this.queryDoc(contributeDocsQuery, i, namespaces);

		const bgAndTargetDocsQuery = bgAndTarget;
		const bgAndTargetDocs = await this.queryDoc(bgAndTargetDocsQuery, i, namespaces);

		const doc = `
		<项目信息文档参考>
		<项目技术栈相关文档>
		${techStackDocs}
		<项目技术栈相关文档/>
		<项目角色与职责相关文档>
		${roleDocs}
		<项目角色与职责相关文档/>
		<项目核心贡献与参与程度相关文档>
		${contributeDocs}
		<项目核心贡献与参与程度相关文档/>
		<项目背景与目的相关文档>
		${bgAndTargetDocs}
		<项目背景与目的相关文档/>
		</项目信息文档参考>
		`;

		return doc;
	}

	/**
	 * 检索项目亮点相关文档
	 */
	async retrievedDocsFromLightspot(i: ProjectProcessingInput) {
		const { lightspot } = i.project;
		const { team, skill, user } = lightspot;
		const namespaces = [
			KnowledgeNamespace.PROJECT_DOC_USER,
			KnowledgeNamespace.TECH_DOC,
			KnowledgeNamespace.OTHER,
			KnowledgeNamespace.USER_PROJECT_DEEPWIKI
		];
		const lightspots = [...team, ...skill, ...user];
		const lightspotQueries = [...lightspots];

		const lightspotDocs = asyncMap(lightspotQueries, async query => {
			return await this.queryDoc(query, i, namespaces);
		});

		const docs = lightspots.map((lightspot, index) => {
			return lightspotDocs[index]
				? `
			<项目亮点"${lightspots[index].slice(0, 10)}..."文档参考>
			${lightspotDocs[index]}
			</项目亮点"${lightspots[index].slice(0, 10)}..."文档参考>
			`
				: '';
		});

		const doc = `
		<项目亮点文档参考>
		${docs}
		</项目亮点文档参考>
		`;

		return doc;
	}

	private async queryDoc(
		query: string,
		i: ProjectProcessingInput,
		namespaces: KnowledgeNamespace[],
		topK = 5,
		minScore = 0.6
	) {
		const docsQueryResult =
			await this.knowledgeVDBService.retrieveKnowbaseFromNamespaceWithScoreFilter(
				query,
				topK,
				i.userInfo,
				i.project.name!,
				namespaces,
				minScore
			);

		const doc = `
		<项目文档参考>
		${docsQueryResult[KnowledgeNamespace.USER_PROJECT_DEEPWIKI]}
		${docsQueryResult[KnowledgeNamespace.PROJECT_DOC_USER]}
		</项目文档参考>
		<项目相关技术文档参考>
		${docsQueryResult[KnowledgeNamespace.TECH_DOC]}
		</项目相关技术文档参考>
		<项目相关其他信息参考>
		${docsQueryResult[KnowledgeNamespace.OTHER]}
		</项目相关其他信息参考>
		`;

		return doc;
	}

	async retrievedProjectCodes(i: ProjectProcessingInput, business: BusinessEnum) {
		const project_code_cache = await this.cacheService.getOrSet(
			this.cacheService.getProjectRetrievedCodeKey(i.project.name!, i.userInfo.userId),
			async () => {
				return await this._retrievedProjectCodes(i, business);
			},
			L1_DEFAULT_TTL.LONG,
			L2_DEFAULT_TTL.LONG
		);
		return project_code_cache;
	}

	/**
	 * 知识库集成：检索项目（projectDto）相关代码
	 */
	async _retrievedProjectCodes(i: ProjectProcessingInput, business: BusinessEnum) {
		try {
			switch (business) {
				case BusinessEnum.lookup:
					return '无';
				case BusinessEnum.polish:
				case BusinessEnum.mine:
				case BusinessEnum.aichat:
					return this.retrievedCodesFromLightspot(i);
				case BusinessEnum.businessLookup:
				case BusinessEnum.businessPaper:
					return this.retrievedCodesFromLightspot(i);
			}
		} catch (e) {
			return '项目代码库未找到或检索失败';
		}
	}

	/**
	 * 检索项目亮点相关代码
	 */
	private async retrievedCodesFromLightspot(i: ProjectProcessingInput) {
		const { lightspot } = i.project;
		const { team, skill, user } = lightspot;

		const lightspots = [...team, ...skill, ...user];
		const lightspotQueries = [...lightspots];

		const lightspotCodes = asyncMap(lightspotQueries, async query => {
			return await this.queryCode(query, i);
		});

		const codes = lightspots.map((lightspot, index) => {
			return lightspotCodes[index]
				? `
			<项目亮点"${lightspots[index].slice(0, 10)}..."代码参考>
			${lightspotCodes[index]}
			</项目亮点"${lightspots[index].slice(0, 10)}..."代码参考>
			`
				: '';
		});

		const code = `
		<项目亮点相关代码参考>
		${codes}
		</项目亮点相关代码参考>
		`;

		return code;
	}

	private async queryCode(query: string, i: ProjectProcessingInput, topK = 5, minScore = 0.3) {
		const codeQueryResult = await this.projectCodeVDBService.retrieveCodeChunksWithScoreFilter(
			query,
			topK,
			i.userInfo,
			i.project.name!,
			minScore
		);

		const code = `
		<相关代码>
		${codeQueryResult}
		</相关代码>
		`;

		return code;
	}

	/**
	 * 知识库集成：根据用户输入检索相关文档
	 */
	async retrievedDomainDocsFromUserInput(input: string, i: ProjectProcessingInput) {
		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 500,
			chunkOverlap: 150
		});
		const inputTetxs = await textSplitter.splitText(input);
		const namespaces = [
			KnowledgeNamespace.PROJECT_DOC_USER,
			KnowledgeNamespace.TECH_DOC,
			KnowledgeNamespace.OTHER,
			KnowledgeNamespace.USER_PROJECT_DEEPWIKI
		];
		const docs = await asyncMap(inputTetxs, async text => {
			return await this.queryDoc(text, i, namespaces);
		});
		const doc = `
		<相关文档参考>
		${docs.join('\n')}
		</相关文档参考>
		`;
		return doc;
	}
	/**
	 * 知识库集成：根据用户输入检索相关代码
	 */
	async retrievedProjectCodesFromUserInput(input: string, i: ProjectProcessingInput) {
		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 500,
			chunkOverlap: 150
		});
		const inputTetxs = await textSplitter.splitText(input);
		const codes = await asyncMap(inputTetxs, async text => {
			return await this.queryCode(text, i);
		});
		const code = `
		<相关代码参考>
		${codes.join('\n')}
		</相关代码参考>
		`;
		return code;
	}
}
