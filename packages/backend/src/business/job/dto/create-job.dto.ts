import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
	@IsString()
	@IsNotEmpty()
	readonly jobName: string;

	@IsString()
	@IsNotEmpty()
	readonly companyName: string;

	@IsString()
	@IsNotEmpty()
	readonly description: string;

	@IsOptional()
	@IsString()
	readonly location?: string;

	@IsOptional()
	@IsString()
	readonly salary?: string;

	@IsOptional()
	@IsString()
	readonly link?: string;
}
