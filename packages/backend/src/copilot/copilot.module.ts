import { Module } from '@nestjs/common';
import { ModelModule } from '../model/model.module';
import { CopilotkitController } from './copilotkit.controller';

@Module({
	imports: [ModelModule],
	controllers: [CopilotkitController],
	providers: [],
	exports: []
})
export class CopilotModule {}
