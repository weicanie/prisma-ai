import { Module } from '@nestjs/common';
import { ModelModule } from '../model/model.module';
import { VectorStoreService } from './vector-store.service';
// TODO 编写适配器,支持多种向量数据库
@Module({
	controllers: [],
	providers: [VectorStoreService],
	exports: [VectorStoreService],
	imports: [ModelModule]
})
export class VectorStoreModule {}
