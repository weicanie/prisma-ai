import {
	IsBoolean,
	IsDateString,
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength
} from 'class-validator';
import type { EducationDegree } from '../entities/education.entity';

export class CreateEducationDto {
	@IsString({ message: 'school 必须为字符串' })
	@IsNotEmpty({ message: 'school 不能为空' })
	@MaxLength(200, { message: 'school 长度不能超过 200' })
	school: string;

	@IsString({ message: 'major 必须为字符串' })
	@IsNotEmpty({ message: 'major 不能为空' })
	@MaxLength(200, { message: 'major 长度不能超过 200' })
	major: string;

	@IsIn(['博士', '硕士', '本科', '大专', '高中', '其他'], { message: 'degree 不在允许的枚举中' })
	degree: EducationDegree;

	@IsDateString({}, { message: 'startDate 必须为 ISO 日期字符串' })
	startDate: string;

	@IsOptional()
	@IsDateString({}, { message: 'endDate 必须为 ISO 日期字符串' })
	endDate?: string;

	@IsOptional()
	@IsBoolean({ message: 'visible 必须为布尔值' })
	visible?: boolean;

	@IsOptional()
	@IsString({ message: 'gpa 必须为字符串' })
	@MaxLength(20, { message: 'gpa 长度不能超过 20' })
	gpa?: string;

	@IsOptional()
	@IsString({ message: 'description 必须为字符串' })
	@MaxLength(5000, { message: 'description 长度不能超过 5000' })
	description?: string;
}
