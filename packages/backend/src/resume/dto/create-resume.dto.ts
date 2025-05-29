import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateResumeDto {
	@ApiProperty({ description: 'The name of the resume', example: 'Software Engineer Resume' })
	@IsString()
	@IsNotEmpty()
	readonly name: string;

	@ApiPropertyOptional({
		description: 'An array of skill IDs associated with the resume',
		type: [String],
		example: ['60d5ec49f72e9e001c8f8b3b', '60d5ec49f72e9e001c8f8b3c']
	})
	@IsArray()
	@IsMongoId({ each: true })
	@IsOptional()
	readonly skills?: string[];

	@ApiPropertyOptional({
		description: 'An array of project IDs associated with the resume',
		type: [String],
		example: ['60d5ec49f72e9e001c8f8b3d', '60d5ec49f72e9e001c8f8b3e']
	})
	@IsArray()
	@IsMongoId({ each: true })
	@IsOptional()
	readonly projects?: string[];
}
