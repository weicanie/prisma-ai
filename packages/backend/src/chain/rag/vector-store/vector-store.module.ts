import { Module } from '@nestjs/common';
import { ModelModule } from '../../../model/model.module';
import { VectorStoreService } from './vector-store.service';

@Module({
	controllers: [],
	providers: [VectorStoreService],
	exports: [VectorStoreService],
	imports: [ModelModule]
})
export class VectorStoreModule {}
