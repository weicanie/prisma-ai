import { projectMinedSchema } from '@prism-ai/shared';
import { createZodDto } from 'nestjs-zod';
export class projectMinedDto extends createZodDto(projectMinedSchema) {}
