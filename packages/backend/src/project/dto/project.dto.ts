import { createZodDto } from 'nestjs-zod';
import { projectSchema } from '../../types/project';
export class ProjectDto extends createZodDto(projectSchema) {}
