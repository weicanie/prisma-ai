import { z } from 'zod';

const infoSchema = z
	.object({
		name: z.string().min(2).max(100).describe('项目名称'),
		desc: z.object({
			role: z.string().optional().describe('用户在项目中的角色和职责'),
			contribute: z.string().optional().describe('用户的核心贡献和参与程度'),
			bgAndTarget: z.string().optional().describe('项目的背景和目的')
		}),
		techStack: z.array(z.string()).optional().default([]).describe('项目的技术栈')
	})
	.describe('项目信息的结构化描述');

/**
 * @param item 每个亮点的类型
 * @returns
 */
function getLightspotSchema(item: any = z.string()) {
	return z
		.object({
			team: z.array(item).default([]).describe('团队贡献方面的亮点'),
			skill: z.array(item).default([]).describe('技术亮点/难点方面的亮点'),
			user: z.array(item).default([]).describe('用户体验/业务价值方面的亮点')
		})
		.describe('项目亮点的结构化描述');
}

const projectSchema = z.object({
	info: infoSchema,
	lightspot: getLightspotSchema()
});

const projectPolishedSchema = z.object({
	info: infoSchema,
	lightspot: getLightspotSchema(
		z.object({
			content: z.string().describe('亮点内容'),
			advice: z.string().default('NONE').describe('亮点改进建议')
		})
	)
});

const projectMinedSchema = z.object({
	info: infoSchema,
	lightspot: getLightspotSchema(),
	lightspotAdded: getLightspotSchema(
		z.object({
			content: z.string().describe('亮点内容'),
			reason: z.string().default('NONE').describe('亮点添加原因'),
			tech: z.array(z.string()).default([]).describe('涉及技术')
		})
	)
});

//从zod的schema获取类型定义
interface ProjectSchemaType extends z.infer<typeof projectSchema> {} // 满足开闭原则
interface ProjectPolishedSchemaType extends z.infer<typeof projectPolishedSchema> {}
interface ProjectMinedSchemaType extends z.infer<typeof projectMinedSchema> {}

interface ProjectExperience extends ProjectSchemaType {}
interface ProjectExperiencePolished extends ProjectPolishedSchemaType {}
interface ProjectExperienceMined extends ProjectMinedSchemaType {}

export {
	ProjectExperience,
	ProjectExperienceMined,
	ProjectExperiencePolished,
	projectMinedSchema,
	projectPolishedSchema,
	projectSchema
};
