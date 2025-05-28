import { PartialType } from '@nestjs/swagger'; // Or @nestjs/mapped-types
import { CreateResumeDto } from './create-resume.dto';

export class UpdateResumeDto extends PartialType(CreateResumeDto) {}
