import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { SessionPoolController } from './session-pool.controller';
import { SessionPoolService } from './session-pool.service';

@Module({
	controllers: [SessionPoolController],
	providers: [SessionPoolService],
	imports: [RedisModule]
})
export class SessionPoolModule {}
