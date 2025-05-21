import { registformSchema } from '@prism-ai/shared';
import { createZodDto } from 'nestjs-zod';

export class RegisterUserDto extends createZodDto(registformSchema) {}
