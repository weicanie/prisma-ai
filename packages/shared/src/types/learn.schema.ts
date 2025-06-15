import { z } from 'zod';

const techItemSchema = z.object({
	name: z.string().describe('技术名称'),
	desc: z.string().describe('学习或实现该技术的简要说明')
});

const lightspotItemSchema = z.object({
	name: z.string().describe('亮点名称'),
	desc: z.string().describe('实现该亮点的简要说明')
});

const skillRoadItemSchema = z.object({
	tech: z.array(techItemSchema).describe('需要学习的新技术列表')
});

const projectRoadItemSchema = z.object({
	name: z.string().describe('项目名称'),
	tech: z.array(techItemSchema).describe('项目中需要学习的新技术列表'),
	lightspot: z.array(lightspotItemSchema).describe('项目中需要实现的新亮点列表')
});

export const roadFromDiffSchema = z.object({
	skill: skillRoadItemSchema.describe('从职业技能对比中得出的学习路线'),
	project: z.array(projectRoadItemSchema).describe('从项目经验对比中得出的学习路线')
});

export type RoadFromDiff = z.infer<typeof roadFromDiffSchema>;
