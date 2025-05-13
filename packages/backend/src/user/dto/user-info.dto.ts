import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UserInfoDto {
	@IsNotEmpty()
	@ApiProperty({ name: 'username' })
	username: string;

	@IsNotEmpty()
	@ApiProperty({ name: 'password' })
	password: string;
}
