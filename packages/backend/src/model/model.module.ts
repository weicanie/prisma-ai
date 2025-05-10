import { Module } from '@nestjs/common';
import { HAModelClientModule } from './HAModelClient/HAModelClient.module';
import { ModelService } from './model.service';

@Module({
	controllers: [],
	providers: [ModelService],
	exports: [ModelService],
	imports: [HAModelClientModule]
})
export class ModelModule {}
