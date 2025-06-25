import { projectSchema } from '@prism-ai/shared';
import { createZodDto } from 'nestjs-zod';
/* 两种数据验证方式
1、 createZodDto(zodSchema) + ZodValidationPipe
2、 class-validator(使用其装饰器装饰的class) + ValidationPipe
*/
export class ProjectDto extends createZodDto(projectSchema) {}
