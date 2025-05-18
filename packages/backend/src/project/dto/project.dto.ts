import { createZodDto } from 'nestjs-zod';
import { projectSchema } from '../project.schema';
export class ProjectDto extends createZodDto(projectSchema) {}
//TODO 能进行数据验证?（得上Validation Pipe）
