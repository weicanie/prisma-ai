import { z } from 'zod';
/* 人岗匹配 llm rerank 时返回的schema */
export const hjmRerankSchema = z.object({
	ranked_jobs: z
		.array(
			z.object({
				job_id: z.string().describe('岗位的唯一标识符'),
				reason: z.string().describe('该岗位与简历匹配的具体原因')
			})
		)
		.describe('按匹配度从高到低排序的岗位列表')
});
