import { z } from 'zod';
//TODO 真不支持?还是只是类型体操保错运行时正常?
/* 
shadcn-ui的 form 要求schema不能有optional()和default()
前者不支持,后者通过defaultValues来实现
*/
const infoSchemaForm = z
	.object({
		name: z.string().min(2).max(100).describe('项目名称'),
		desc: z.object({
			role: z.string().describe('用户在项目中的角色和职责'),
			contribute: z.string().describe('用户的核心贡献和参与程度'),
			bgAndTarget: z.string().describe('项目的背景和目的')
		}),
		techStack: z.array(z.string()).describe('项目的技术栈')
	})
	.describe('项目信息的结构化描述');

function getLightspotSchemaForm(item: any = z.string()) {
	return z
		.object({
			team: z.array(item).describe('团队贡献方面的亮点'),
			skill: z.array(item).describe('技术亮点/难点方面的亮点'),
			user: z.array(item).describe('用户体验/业务价值方面的亮点')
		})
		.describe('项目亮点的结构化描述');
}
const projectSchemaForm = z.object({
	info: infoSchemaForm,
	lightspot: getLightspotSchemaForm()
});

const projectPolishedSchemaForm = z.object({
	info: infoSchemaForm,
	lightspot: getLightspotSchemaForm(
		z.object({
			content: z.string().describe('亮点内容'),
			advice: z.string().default('NONE').describe('亮点改进建议')
		})
	)
});

const projectMinedSchemaForm = z.object({
	info: infoSchemaForm,
	lightspot: getLightspotSchemaForm(),
	lightspotAdded: getLightspotSchemaForm(
		z.object({
			content: z.string().describe('亮点内容'),
			reason: z.string().default('NONE').describe('亮点添加原因'),
			tech: z.array(z.string()).default([]).describe('涉及技术')
		})
	)
});

export { projectMinedSchemaForm, projectPolishedSchemaForm, projectSchemaForm };
