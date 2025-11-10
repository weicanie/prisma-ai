import { Module } from '@nestjs/common';
import { HAModelClientService } from './HAModelClient.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { FactoryService } from './services/factory.service';
import { RetryService } from './services/retry.service';
@Module({
	controllers: [],
	providers: [
		HAModelClientService,
		CircuitBreakerService, //熔断器
		RetryService, //指数退避重试
		FactoryService //限流器和请求队列工厂服务
	],
	exports: [HAModelClientService],
	imports: []
})
export class HAModelClientModule {}
