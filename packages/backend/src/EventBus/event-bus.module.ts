import { Global, Module } from '@nestjs/common';
import { EventBusService } from './event-bus.service';

@Global()
@Module({
	controllers: [],
	providers: [EventBusService],
	exports: [EventBusService],
	imports: []
})
export class EventBusModule {}
