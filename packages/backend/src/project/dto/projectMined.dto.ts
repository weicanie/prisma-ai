import { createZodDto } from 'nestjs-zod';
import { projectMinedSchema } from '../project.schema';
export class projectMinedDto extends createZodDto(projectMinedSchema) {}
