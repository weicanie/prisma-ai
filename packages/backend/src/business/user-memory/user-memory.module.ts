import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChainModule } from '../../chain/chain.module';
import { WithGetUserMemory } from '../../utils/abstract';
import { UserMemory, UserMemorySchema } from './entities/user-memory.entity';
import { UserMemoryController } from './user-memory.controller';
import { UserMemoryService } from './user-memory.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: UserMemory.name, schema: UserMemorySchema }]),
		forwardRef(() => ChainModule)
	],

	controllers: [UserMemoryController],
	providers: [
		UserMemoryService,
		{
			provide: WithGetUserMemory,
			useExisting: UserMemoryService
		}
	],
	exports: [UserMemoryService, WithGetUserMemory]
})
export class UserMemoryModule {}
