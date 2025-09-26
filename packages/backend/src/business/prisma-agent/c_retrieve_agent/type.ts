import z from 'zod';

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

export const rewriteQuerySchema = z.object({
	rewrittenQuery: z
		.string()
		.describe('为搜索引擎重写的简洁、关键词驱动的查询语句。输出最佳语句(1条)')
});
