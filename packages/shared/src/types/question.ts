import { z } from 'zod';

export const startCrawlQuestionSchema = z.object({
	list: z.string().url({ message: '必须是合法的URL' }).min(1, 'URL不能为空'),
	domain: z.string().url({ message: '必须是合法的URL' }).min(1, 'URL不能为空')
});

export type StartCrawlQuestionDto = z.infer<typeof startCrawlQuestionSchema>;
