import { Module } from '@nestjs/common';
import { ChatHistoryService } from './chat_history.service';
import { HAModelClientModule } from './HAModelClient/HAModelClient.module';
import { ModelService } from './model.service';
import { ThoughtModelService } from './thought-model.service';

@Module({
	controllers: [],
	providers: [ModelService, ChatHistoryService, ThoughtModelService],
	exports: [ModelService, ThoughtModelService],
	imports: [
		HAModelClientModule
		// ConfigModule.forFeature(() => {
		// 	return {};
		// })
	]
})
export class ModelModule {}
