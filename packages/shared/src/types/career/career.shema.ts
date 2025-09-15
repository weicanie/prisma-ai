import { z } from 'zod';

const careerSchemaForm = z
	.object({
		company: z.string().min(1).max(200).describe('公司名称'),
		position: z.string().min(1).max(200).describe('职位名称'),
		startDate: z.string().min(1).describe('入职日期(ISO 字符串或 YYYY-MM-DD)'),
		endDate: z.string().describe('离职日期(可空，当前在职可留空)'),
		visible: z.boolean().describe('是否在简历中展示'),
		details: z.string().max(10000).describe('工作职责/业绩（可富文本）')
	})
	.describe('工作经历的结构化表单 Schema');

type CareerForm = z.infer<typeof careerSchemaForm>;

export { careerSchemaForm, type CareerForm };
