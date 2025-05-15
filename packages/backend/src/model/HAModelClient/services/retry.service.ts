import { Injectable, Logger } from '@nestjs/common';
//指数退避实现
@Injectable()
export class RetryService {
	private readonly logger = new Logger(RetryService.name);

	async exponentialBackoff<T>(
		fn: () => Promise<T>,
		options: {
			maxRetries: number;
			initialDelayMs: number;
			maxDelayMs: number;
			factor: number;
			retryableErrors?: RegExp[];
		}
	): Promise<T> {
		const { maxRetries, initialDelayMs, maxDelayMs, factor, retryableErrors } = options;
		let attempt = 0;

		while (true) {
			try {
				return await fn();
			} catch (error) {
				attempt++;

				// 检查是否达到最大重试次数
				if (attempt >= maxRetries) {
					this.logger.error(`最大重试次数(${maxRetries})已达到，停止重试`, error);
					throw error;
				}

				// 检查错误是否可重试
				if (retryableErrors && retryableErrors.length > 0) {
					const errorStr = error.toString();
					const shouldRetry = retryableErrors.some(pattern => pattern.test(errorStr));
					if (!shouldRetry) {
						this.logger.warn(`错误不符合重试条件，不重试、直接抛出`, error);
						throw error;
					}
				}

				// 计算等待时间（指数退避）
				const delayMs = Math.min(initialDelayMs * Math.pow(factor, attempt - 1), maxDelayMs);

				this.logger.warn(`请求失败，${delayMs}ms后进行第${attempt}次重试`, error.message);

				// 等待指定时间后重试
				await new Promise(resolve => setTimeout(resolve, delayMs));
			}
		}
	}
}
