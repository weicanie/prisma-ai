import { PartialType } from '@nestjs/swagger';
import { CreateEducationDto } from './create-education.dto';

// 使用 PartialType 生成可选字段的更新 DTO
export class UpdateEducationDto extends PartialType(CreateEducationDto) {}
