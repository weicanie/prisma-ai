import { Injectable, Logger } from '@nestjs/common';
import CircuitBreaker from 'opossum';
//使用Opossum库实现熔断保护
@Injectable()
export class CircuitBreakerService {
	private breakers: Map<string, CircuitBreaker> = new Map();
	private readonly logger = new Logger(CircuitBreakerService.name);

	/**
	 * 创建熔断器实例，每个实例的状态互不影响单独统计
	 * @param name 熔断器名称
	 * @param fn 熔断器函数
	 * @param options 熔断器选项
	 * @returns 熔断器实例
	 */
	getBreaker(name: string, fn: any, options: CircuitBreaker.Options = {}) {
		const existing = this.breakers.get(name);
		if (existing) return existing;

		const defaultOptions: CircuitBreaker.Options = {
			resetTimeout: 10000, // 10秒后尝试半开状态
			timeout: 24 * 60 * 60 * 1000, // 24小时超时视为失败（llm生成可能需要很长时间，尤其是低并发的glm-4.5）
			volumeThreshold: 10, // 至少10次请求后才统计失败率
			errorThresholdPercentage: 50, // 失败率达50%时触发断路
			rollingCountTimeout: 24 * 60 * 60 * 1000 // 失败率统计窗口期24小时（超过这个时间未完成也会视为失败!!!）
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
}
