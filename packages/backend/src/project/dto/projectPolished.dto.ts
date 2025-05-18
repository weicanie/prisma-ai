import { createZodDto } from 'nestjs-zod';
import { projectPolishedSchema } from '../project.schema';
export class projectPolishedtDto extends createZodDto(projectPolishedSchema) {}
