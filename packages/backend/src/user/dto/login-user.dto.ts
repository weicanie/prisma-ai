import { loginformSchema } from '@prism-ai/shared';
import { createZodDto } from 'nestjs-zod';

export class LoginUserDto extends createZodDto(loginformSchema) {}
