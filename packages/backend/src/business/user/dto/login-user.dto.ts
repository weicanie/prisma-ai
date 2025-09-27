import { loginformSchema } from '@prisma-ai/shared';
import { createZodDto } from 'nestjs-zod';

export class LoginUserDto extends createZodDto(loginformSchema) {}
