import { Injectable, Logger } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';
//使用Opossum库实现熔断保护
@Injectable()
export class CircuitBreakerService {
	private breakers: Map<string, CircuitBreaker> = new Map();
	private readonly logger = new Logger(CircuitBreakerService.name);

	createBreaker(name: string, fn: any, options: CircuitBreaker.Options = {}) {
		const defaultOptions: CircuitBreaker.Options = {
			failureThreshold: 50, // 失败率达50%时触发断路
			resetTimeout: 30000, // 30秒后尝试半开状态
			timeout: 100000, // 100秒超时视为失败
			errorThresholdPercentage: 50,
			rollingCountTimeout: 60000 // 统计窗口期1分钟
		};

		const mergedOptions = { ...defaultOptions, ...options };
		const breaker = new CircuitBreaker(fn, mergedOptions);

		// 添加事件监听
		breaker.on('open', () => {
			this.logger.warn(`Circuit Breaker ${name} is open`);
		}); //切断电流保护线路：停止向可能已故障的服务发送请求，防止级联失败
		breaker.on('halfOpen', () => {
			this.logger.log(`Circuit Breaker ${name} is half-open`);
		}); //试探性地恢复供电：允许限制数量的请求通过，测试服务是否已恢复
		breaker.on('close', () => {
			this.logger.log(`Circuit Breaker ${name} is closed`);
		}); //确认线路安全后恢复正常供电
		breaker.on('fallback', data => {
			this.logger.warn(`Circuit Breaker ${name} fallback called`, data);
		}); //执行预定义的备用函数，提供替代响应

		this.breakers.set(name, breaker);
		return breaker;
	}

	getBreaker(name: string) {
		return this.breakers.get(name);
	}
}
