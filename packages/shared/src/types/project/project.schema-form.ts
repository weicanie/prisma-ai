import { z } from 'zod';

/* 将原有的schema的default()和optional()去掉
react-hook-form的 useForm 会报类型错误
	疑似是schema对象嵌套导致optional()报错
		本身optional()是可以用的,只是default()不能用

polyfill：
- 表单的非必填项不使用 optional()，而是允许提交空字符串 ''
- 必填项用 .min(1) 实现必填
- 通过useForm 的 defaultValues 控制默认值

表单中的非required是允许用户不填写（即允许提交''）
required是必须填写的（即不允许提交''）
*/
const infoSchemaForm = z
	.object({
		//只允许英文字母、数字和-、_
		name: z
			.string()
			.min(2)
			.max(40)
			.regex(/^[a-zA-Z0-9-_]+$/)
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
