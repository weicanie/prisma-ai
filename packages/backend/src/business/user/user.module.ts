import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { EmailModule } from '../../email/email.module';
import { RedisModule } from '../../redis/redis.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
	imports: [
		RedisModule,
		EmailModule,
		JwtModule.registerAsync({
			global: true,
			useFactory() {
				return {
					signOptions: {}
				};
			}
		})
	]
})
export class UserModule {}
