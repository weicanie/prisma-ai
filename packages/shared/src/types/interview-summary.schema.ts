import { z } from 'zod';

/**
 * 面经通过llm提取出的面试题
 */
export const interviewSummaryArticleSchema = z.object({
	title: z.string().describe('问题'),
	content: z.string().describe('问题答案'),
	gist: z.string().describe('摘要'),
	content_mindmap: z.string().describe('思维导图摘要'),
	hard: z.string().describe('难度评级,从易到难1~5'),
	quiz_type: z.string().describe('题目考察方式,为其中之一：选择题、问答题、力扣算法题、其它'),
	content_type: z.string().describe('题目内容类型,如：javascript、typescript')
});

export type InterviewSummaryArticle = z.infer<typeof interviewSummaryArticleSchema>;
