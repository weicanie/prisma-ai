import { registformSchema } from '@prisma-ai/shared';
import { createZodDto } from 'nestjs-zod';

export class RegisterUserDto extends createZodDto(registformSchema) {}
