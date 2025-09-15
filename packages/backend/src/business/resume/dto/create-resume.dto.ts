import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateResumeDto {
	@IsString()
	@IsNotEmpty()
	readonly name: string;

	@IsMongoId()
	@IsOptional()
	readonly skill?: string; //id

	@IsArray()
	@IsMongoId({ each: true })
	@IsOptional()
	readonly projects?: string[]; //id

	@IsArray()
	@IsMongoId({ each: true })
	@IsOptional()
	readonly careers?: string[]; //id

	@IsArray()
	@IsMongoId({ each: true })
	@IsOptional()
	readonly educations?: string[]; //id
}
