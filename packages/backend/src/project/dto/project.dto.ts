import { projectSchema } from '@prism-ai/shared';
import { createZodDto } from 'nestjs-zod';
export class ProjectDto extends createZodDto(projectSchema) {}
//TODO 能进行数据验证?（得上Validation Pipe）
