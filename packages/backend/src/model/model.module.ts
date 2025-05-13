import { Module } from '@nestjs/common';
import { ChatHistoryService } from './chat_history.service';
import { HAModelClientModule } from './HAModelClient/HAModelClient.module';
import { ModelService } from './model.service';

@Module({
	controllers: [],
	providers: [ModelService, ChatHistoryService],
	exports: [ModelService],
	imports: [
		HAModelClientModule
		// ConfigModule.forFeature(() => {
		// 	return {};
		// })
	]
})
export class ModelModule {}
