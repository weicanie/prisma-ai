import {
	IsBoolean,
	IsDateString,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength
} from 'class-validator';

export class CreateCareerDto {
	@IsString({ message: 'company 必须为字符串' })
	@IsNotEmpty({ message: 'company 不能为空' })
	@MaxLength(200, { message: 'company 长度不能超过 200' })
	company: string;

	@IsString({ message: 'position 必须为字符串' })
	@IsNotEmpty({ message: 'position 不能为空' })
	@MaxLength(200, { message: 'position 长度不能超过 200' })
	position: string;

	@IsDateString({}, { message: 'startDate 必须为 ISO 日期字符串' })
	startDate: string;

	@IsOptional()
	@IsDateString({}, { message: 'endDate 必须为 ISO 日期字符串' })
	endDate?: string;

	@IsOptional()
	@IsBoolean({ message: 'visible 必须为布尔值' })
	visible?: boolean;

	@IsOptional()
	@IsString({ message: 'details 必须为字符串' })
	@MaxLength(10000, { message: 'details 长度不能超过 10000' })
	details?: string;
}
