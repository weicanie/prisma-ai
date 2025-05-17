import { createZodDto } from 'nestjs-zod';
import { projectSchema } from '../../types/project.schema';
export class ProjectDto extends createZodDto(projectSchema) {}
