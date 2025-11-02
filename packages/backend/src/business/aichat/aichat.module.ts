import { Module } from '@nestjs/common';
import { CacheModule } from '../../cache/cache.module';
import { ChainModule } from '../../chain/chain.module';
import { SseSessionManagerModule } from '../../manager/sse-session-manager/sse-session-manager.module';
import { TaskManagerModule } from '../../manager/task-manager/task-manager.module';
import { RedisModule } from '../../redis/redis.module';
import { ProjectModule } from '../project/project.module';
import { UserMemoryModule } from '../user-memory/user-memory.module';
import { AichatController } from './aichat.controller';
import { AichatService } from './aichat.service';
@Module({
	controllers: [AichatController],
	providers: [AichatService],
	exports: [AichatService],
	imports: [
		ChainModule,
		ProjectModule,
		UserMemoryModule,
		CacheModule,
		TaskManagerModule,
		RedisModule,
		SseSessionManagerModule
	]
})
export class AichatModule {}
