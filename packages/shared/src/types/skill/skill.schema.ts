import { z } from 'zod';

export const skillItemSchema = z.object({
	type: z.string().default(''),
	content: z.array(z.string()).default([])
});

export const skillSchema = z.object({
	content: z.array(skillItemSchema)
});

export const skillDtoSchema = skillSchema.extend({
	name: z.string().min(1, '请输入技能清单名称')
});
