import { projectMinedSchema } from '@prisma-ai/shared';
import { createZodDto } from 'nestjs-zod';
export class projectMinedDto extends createZodDto(projectMinedSchema) {}
