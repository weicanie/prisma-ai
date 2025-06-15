import { z } from 'zod';
import { projectSchema } from './project.schema';
import { skillSchema } from './skill.schema';
/**
 * match chain 传入的简历
 */
export const resumeMatchedSchema = z.object({
	name: z.string().describe('简历名称'),
	skill: skillSchema.describe('专业技能清单'),
	projects: z.array(projectSchema).describe('项目经验列表')
});
