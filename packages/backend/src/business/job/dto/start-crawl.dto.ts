/**
 * 爬虫启动参数的数据传输对象
 */
export class StartCrawlDto {
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
	 * 职位 (可选)
	 */
	position?: string;
}
