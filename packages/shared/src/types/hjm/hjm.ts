import { JobVo } from '../job/';
/**
 * 人岗匹配前端上传的 DTO
 */
export interface HjmMatchDto {
	resumeId: string; // 简历的id
	topK?: number; // 召回数量，默认为20
	rerankTopN?: number; // 最终返回的重排后岗位数量，默认为5
}
/**
 * 人岗匹配后端返回的VO,即简历匹配到的岗位Vo
 */
export interface MatchedJobVo extends JobVo {
	reason?: string;
}

/**
 * 爬虫启动参数的数据传输对象
 */
export interface StartCrawlDto {
	/**
	 * 要爬取的岗位总数
	 */
	totalCount: number;

	/**
	 * 城市代码, 例如: 'c101020100' 代表上海
	 */
	city: string;

	/**
	 * 搜索关键词, 例如: '全栈工程师'
	 * 传入单个关键词则使用llm扩展关键词
	 * 数组则直接爬取
	 */
	query: string | string[];

	/**
	 * 行业 (可选)
	 */
	industry?: string;

	/**
	 * 职位名称 (可选)
	 */
	position?: string;

	/**
	 * 页面加载/操作失败时的最大重试次数
	 * @default 7
	 */
	maxRetries?: number;
}
