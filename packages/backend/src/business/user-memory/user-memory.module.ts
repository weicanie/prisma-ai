import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChainModule } from '../../chain/chain.module';
import { UserMemory, UserMemorySchema } from './entities/user-memory.entity';
import { UserMemoryController } from './user-memory.controller';
import { UserMemoryService } from './user-memory.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: UserMemory.name, schema: UserMemorySchema }]),
		ChainModule
	],
	controllers: [UserMemoryController],
	providers: [UserMemoryService],
	exports: [UserMemoryService]
})
export class UserMemoryModule {}
