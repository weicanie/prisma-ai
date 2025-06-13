import { forwardRef, Module } from '@nestjs/common';
import { EventBusModule } from '../EventBus/event-bus.module';
import { NodejsM3eService } from './nodejs-m3e.service.js';
import { VectorStoreService } from './vector-store.service';
// TODO 编写适配器,支持多种向量数据库
@Module({
	controllers: [],
	providers: [VectorStoreService, NodejsM3eService],
	imports: [forwardRef(() => EventBusModule)],
	exports: [VectorStoreService]
})
export class VectorStoreModule {}
