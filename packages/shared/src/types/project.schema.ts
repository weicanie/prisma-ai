import { z } from 'zod';

const infoSchema = z
	.object({
		name: z.string().min(2).max(100).describe('项目名称'),
		desc: z.object({
			role: z.string().describe('用户在项目中的角色和职责').optional().default(''),
			contribute: z.string().describe('用户的核心贡献和参与程度').optional().default(''),
			bgAndTarget: z.string().describe('项目的背景和目的').optional().default('')
		}),
		techStack: z.array(z.string()).describe('项目的技术栈').default([])
	})
	.describe('项目信息的结构化描述');

/**
 * @param item 每个亮点的类型
 * @returns
 */
export function getLightspotSchema(item: any = z.string(), polish = false) {
	if (polish) {
		return z
			.object({
				team: z.array(item).describe('团队贡献方面的亮点').default([]),
				skill: z.array(item).describe('技术亮点/难点方面的亮点').default([]),
				user: z.array(item).describe('用户体验/业务价值方面的亮点').default([]),
				delete: z
					.array(
						z.object({
							content: z.string().describe('亮点内容'),
							reason: z.string().describe('亮点删除原因').default('NONE')
						})
					)
					.describe('删除的亮点')
					.default([])
			})
			.describe('项目亮点的结构化描述');
	}
	return z
		.object({
			team: z.array(item).describe('团队贡献方面的亮点').default([]),
			skill: z.array(item).describe('技术亮点/难点方面的亮点').default([]),
			user: z.array(item).describe('用户体验/业务价值方面的亮点').default([])
		})
		.describe('项目亮点的结构化描述');
}

const projectSchema = z.object({
	info: infoSchema,
	lightspot: getLightspotSchema()
});

const projectPolishedSchema = z.object({
	info: infoSchema,
	// polishedInfo: infoSchema.optional(),
	lightspot: getLightspotSchema(
		z.object({
			content: z.string().describe('亮点内容'),
			advice: z.string().describe('亮点改进建议').default('NONE')
		}),
		true
	)
});

const projectMinedSchema = z.object({
	info: infoSchema,
	lightspot: getLightspotSchema(),
	lightspotAdded: getLightspotSchema(
		z.object({
			content: z.string().describe('亮点内容'),
			reason: z.string().describe('亮点添加原因').default('NONE'),
			tech: z.array(z.string()).describe('涉及技术').default([])
		})
	)
});

const lookupResultSchema = z.object({
	problem: z
		.array(
			z.object({
				name: z.string().describe('问题名称'),
				desc: z.string().describe('问题描述')
			})
		)
		.describe('存在的问题')
		.default([]),
	solution: z
		.array(
			z.object({
				name: z.string().describe('解决方案名称'),
				desc: z.string().describe('解决方案描述')
			})
		)
		.describe('解决方案')
		.default([]),
	score: z.number().describe('项目描述评分, 0-100分').default(0)
});

const projectLookupedSchema = z.object({
	info: infoSchema,
	lightspot: getLightspotSchema(),
	lookupResult: lookupResultSchema
});

export {
	lookupResultSchema,
	projectLookupedSchema,
	projectMinedSchema,
	projectPolishedSchema,
	projectSchema
};
