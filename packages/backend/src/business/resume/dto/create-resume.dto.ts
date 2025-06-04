import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateResumeDto {
	@IsString()
	@IsNotEmpty()
	readonly name: string;

	@IsMongoId()
	@IsOptional()
	readonly skill?: string;

	@IsArray()
	@IsMongoId({ each: true })
	@IsOptional()
	readonly projects?: string[];
}
