import { projectPolishedSchema } from '@prism-ai/shared';
import { createZodDto } from 'nestjs-zod';
export class projectPolishedtDto extends createZodDto(projectPolishedSchema) {}
