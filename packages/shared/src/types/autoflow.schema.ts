import { z } from 'zod';
import { projectSchema } from './project/project.schema';
import { skillSchema } from './skill.schema';

/**
 * autoflow chain 从简历文本中提取出的原始JSON
 */
export const autoflowSchema = z.object({
	skill: skillSchema.describe('专业技能清单'),
	projects: z.array(projectSchema).describe('项目经验列表')
});
