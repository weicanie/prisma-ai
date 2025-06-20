import { Module } from '@nestjs/common';
import { ModelModule } from '../model/model.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import RagController from './Rag.controller';
import { RagService } from './Rag.service';

@Module({
  controllers: [RagController],
  providers: [RagService],
  exports: [RagService],
  imports: [ModelModule, VectorStoreModule],
})
class RagModule {}

export default RagModule;
