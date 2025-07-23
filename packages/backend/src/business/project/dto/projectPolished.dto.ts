import { projectPolishedSchema } from '@prisma-ai/shared';
import { createZodDto } from 'nestjs-zod';
export class projectPolishedtDto extends createZodDto(projectPolishedSchema) {}
