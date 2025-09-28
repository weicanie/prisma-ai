import { Module } from '@nestjs/common';
import { EventBusModule } from '../EventBus/event-bus.module';
import { EmbeddingModelService } from './embedding-model.service';
import { VectorStoreService } from './vector-store.service';
// TODO 适配器支持多种向量数据库
@Module({
	controllers: [],
	providers: [VectorStoreService, EmbeddingModelService],
	imports: [EventBusModule],
	exports: [VectorStoreService]
})
export class VectorStoreModule {}
