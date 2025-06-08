export const type_content_Map: Record<string, string> = {
	userProjectDoc: '我的项目文档',
	userProjectRepo: '我的项目github仓库地址',
	openSourceProjectDoc: '开源项目文档',
	openSourceProjectRepo: '开源项目github仓库地址',
	techDoc: '技术文档',
	interviewQuestion: '面试题',
	other: '其他'
};
//上面的作为注释
export enum KnowledgeTypeEnum {
	userProjectDoc = 'userProjectDoc', //我的项目文档
	userProjectRepo = 'userProjectRepo', //我的项目github仓库地址
	openSourceProjectDoc = 'openSourceProjectDoc', //开源项目文档
	openSourceProjectRepo = 'openSourceProjectRepo', //开源项目github仓库地址
	techDoc = 'techDoc', //技术文档
	interviewQuestion = 'interviewQuestion', //面试题
	other = 'other' //其他
}
export enum FileTypeEnum {
	txt = 'txt', //txt
	url = 'url', //url
	doc = 'doc' //文档
}

/* 用户知识库 */
export interface CreateKnowledgeDto {
	name: string; //知识名称
	fileType: `${FileTypeEnum}`; //文件类型 'txt' 'url' 'doc'
	/* 知识标签-声明知识用途-目前由用户自定义
    项目经验优化
    简历匹配岗位
    简历延申论文
  */
	tag: string[]; //知识标签

	/* 知识类型

  1.项目相关
    用户项目
      项目文档 'userProjectDoc'
      项目代码（github地址） 'userProjectRepo'
    同类型开源项目
      开源项目文档 'openSourceProjectDoc'
      开源项目代码（github地址） 'openSourceProjectRepo'
  2.技术相关
    技术文档 'techDoc'
  3.面试相关
    面试题（面经转为面试题） 'interviewQuestion'
  4.其它 'other'

  */
	type: `${KnowledgeTypeEnum}`; //知识类型
	content: string; //知识内容
}

export type UpdateKnowledgeDto = Partial<CreateKnowledgeDto>;

export interface KnowledgeVo {
	id: string;
	name: string;
	type: `${KnowledgeTypeEnum}`;
	createdAt: Date;
	updatedAt: Date;
	fileType: string; // Added missing field
	tag: string[]; // Added missing field
	content: string; // Added missing field
}

/**
 * 分页后的知识库列表结果
 */
export interface PaginatedKnsResult {
	data: KnowledgeVo[]; // 当前页的知识库数据
	total: number; // 总记录数
	page: number; // 当前页码
	limit: number; // 每页数量
}
