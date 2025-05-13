import { Module } from '@nestjs/common';
import { ModelModule } from '../model/model.module';
import RagController from './Rag.controller';
import { RagService } from './Rag.service';
import { VectorStoreModule } from './vector-store/vector-store.module';

@Module({
	controllers: [RagController],
	providers: [RagService],
	exports: [RagService],
	imports: [ModelModule, VectorStoreModule]
})
class RagModule {}

export default RagModule;
