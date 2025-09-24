/* 项目知识库 */
export const project_knowledge_type_label: Record<string, string> = {
	userProjectDoc: '项目文档',
	userProjectCode: '项目github仓库',
	techDoc: '项目相关技术文档',
	other: '项目相关的其他信息',
	userProjectDeepWiki: '项目deepwiki文档'
};
//上面的作为注释
export enum ProjectKnowledgeTypeEnum {
	userProjectDoc = 'userProjectDoc', //项目文档
	userProjectCode = 'userProjectCode', //项目代码仓库
	techDoc = 'techDoc', //项目相关技术文档
	other = 'other', //项目相关的其他信息
	userProjectDeepWiki = 'userProjectDeepWiki' //项目deepwiki文档

	//项目相关面试题
	// interviewQuestion = 'interviewQuestion',
	//开源项目文档
	// openSourceProjectDoc = 'openSourceProjectDoc',
	//开源项目github仓库地址
	// openSourceProjectRepo = 'openSourceProjectRepo',
}
export enum FileTypeEnum {
	txt = 'txt', //txt
	url = 'url', //url
	doc = 'doc', //文档 (目前只支持pdf)
	md = 'md' // markdown文档
}
/* 用户知识库 */
export interface CreateProjectKnowledgeDto {
	name: string; //知识名称
	projectName: string; //项目名称（用于划分项目知识库、关联项目经验）
	fileType: `${FileTypeEnum}`; //文件类型 'txt' 'url' 'doc'
	/* 知识标签-前由用户自定义
    项目经验优化
    简历匹配岗位
    简历延申论文
  */
	tag: string[]; //知识标签

	/* 知识类型-声明知识用途 */
	type: ProjectKnowledgeTypeEnum; //知识类型
	/* 
	1.txt: 文本内容
  2.doc: 文档oss url（前端直传用户上传的pdf文档）
  3.url: 项目github仓库url、文档url
	*/
	content: string; //知识内容
}

export interface DeepWikiKnowledgeDto {
	wikiUrl: string; //项目deepwiki站点地址
}

export interface CreateProjectDeepWikiKnowledgeDto {
	name: string; //知识名称
	projectName: string; //项目名称（用于划分项目知识库、关联项目经验）
	type: ProjectKnowledgeTypeEnum.userProjectDeepWiki;
	wikiUrl: string; //项目deepwiki站点地址
}

export type UpdateProjectKnowledgeDto = CreateProjectKnowledgeDto;

export interface ProjectKnowledgeVo {
	id: string;
	name: string;
	projectName: string; //项目名称（用于划分项目知识库、关联项目经验）
	type: ProjectKnowledgeTypeEnum;
	createdAt: Date;
	updatedAt: Date;
	fileType: string;
	tag: string[];
	content: string;
}

/**
 * 分页后的知识库列表结果
 */
export interface PaginatedProjectKnsResult {
	data: ProjectKnowledgeVo[]; // 当前页的知识库数据
	total: number; // 总记录数
	page: number; // 当前页码
	limit: number; // 每页数量
}
