import { z } from 'zod';

/* 将原有的schema的default()和optional()去掉
react-hook-form的 useForm 会报类型错误
	疑似是schema对象嵌套导致optional()报错
		本身optional()是可以用的,只是default()不能用

default()通过defaultValues参数平替

optional()在ts类型中是允许值为undefined

表单中的非required是允许用户不填写（即允许提交''）
required是必须填写的（即不允许提交''）
	默认即非required, 通过min(1) 实现 required 即可
		input可以这么处理（值都是字符串）
*/
const infoSchemaForm = z
	.object({
		//只允许小写英文字母和-
		name: z
			.string()
			.min(2)
			.max(40)
			.regex(/^[a-z0-9-]+$/)
			.describe('项目名称'),
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

export { projectSchemaForm };
