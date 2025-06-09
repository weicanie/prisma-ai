import { z } from 'zod';
import { projectSchema } from './project.schema';
import { skillSchema } from './skill.schema';

export const resumeMatchedSchema = z.object({
	name: z.string().describe('简历名称'),
	skill: skillSchema.describe('技能清单'),
	projects: z.array(projectSchema).describe('项目经验列表')
});
