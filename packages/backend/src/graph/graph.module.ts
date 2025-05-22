import { Module } from '@nestjs/common';
import { ChainModule } from '../chain/chain.module';
import EventBus from '../EventBus/EventBus';
import { GraphService } from './graph.service';
@Module({
	controllers: [],
	providers: [
		GraphService,
		{
			provide: 'EventBus',
			useClass: EventBus
		}
	],
	imports: [ChainModule]
})
export class GraphModule {}
