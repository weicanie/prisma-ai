import { z } from 'zod';

const degreeEnum = z.enum(['博士', '硕士', '本科', '大专', '高中', '其他']);

const educationSchemaForm = z
	.object({
		school: z.string().min(1).max(200).describe('学校名称'),
		major: z.string().min(1).max(200).describe('专业名称'),
		degree: degreeEnum.describe('学历层次'),
		startDate: z.string().min(1).describe('入学日期(ISO 字符串或 YYYY-MM-DD)'),
		endDate: z.string().describe('毕业日期(可空，在读可留空)'),
		visible: z.boolean().describe('是否在简历中展示'),
		gpa: z.string().max(20).describe('绩点'),
		description: z.string().max(5000).describe('教育经历描述（课程、奖项、社团、项目等）')
	})
	.describe('教育经历的结构化表单 Schema');

type EducationForm = z.infer<typeof educationSchemaForm>;

export { educationSchemaForm, type EducationForm };
