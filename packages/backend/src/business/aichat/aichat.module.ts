import { Module } from '@nestjs/common';
import { CacheModule } from '../../cache/cache.module';
import { ChainModule } from '../../chain/chain.module';
import { ProjectModule } from '../project/project.module';
import { UserMemoryModule } from '../user-memory/user-memory.module';
import { AichatController } from './aichat.controller';
import { AichatService } from './aichat.service';
@Module({
	controllers: [AichatController],
	providers: [AichatService],
	exports: [AichatService],
	imports: [ChainModule, ProjectModule, UserMemoryModule, CacheModule]
})
export class AichatModule {}
