import { z } from 'zod';

export const llmJobSchema = z.object({
	jobName: z.string().describe('职位名称'),
	companyName: z.string().describe('公司名称'),
	description: z.string().describe('职位描述')
});
