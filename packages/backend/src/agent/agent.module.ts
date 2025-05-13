import { Module } from '@nestjs/common';
import { ModelModule } from '../model/model.module';
import { AgentService } from './agent.service';

@Module({
	controllers: [],
	providers: [AgentService],
	imports: [ModelModule],
	exports: [AgentService]
})
export class AgentModule {}
