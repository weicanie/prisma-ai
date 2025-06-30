import { Injectable, Logger } from '@nestjs/common';
import type { DataChunkVO } from '@prism-ai/shared';
import { createHash } from 'crypto';
import { Document } from 'langchain/document';
import { Observable } from 'rxjs';
import { ModelService } from '../../model/model.service';
import { RedisService } from '../../redis/redis.service';
import { VectorStoreService } from '../../vector-store/vector-store.service';

@Injectable()
export class LLMCacheService {
	private readonly CACHE_NAMESPACE = 'llm:cache';
	private readonly CACHE_INDEX = 'llm-cache';
	private readonly SIMILARITY_THRESHOLD = 0.85; // 相似度阈值

	constructor(
		private readonly modelService: ModelService,
		private readonly vectorStoreService: VectorStoreService,
		private readonly redisService: RedisService
	) {
		//不在计划中,腾出一个index
		// this.initCacheIndex();
	}

	// 初始化缓存向量索引
	private async initCacheIndex() {
		try {
			// 检查索引是否已存在
			const exists = await this.vectorStoreService.indexExists(this.CACHE_INDEX);
			if (!exists) {
				// 创建一个空索引
				await this.vectorStoreService.createEmptyIndex(
					this.CACHE_INDEX,
					this.modelService.embedModel_openai.dimensions ?? 1536
				);
			}
			const logger = new Logger();
			logger.log(`使用向量数据库索引:${this.CACHE_INDEX}`, 'LLMCacheService');
		} catch (error) {
			console.error('Failed to initialize cache index:', error);
		}
	}

	// 为prompt生成唯一标识符
	private generatePromptId(context: Record<string, any>): string {
		const normalizedContext = { ...context };
		// 移除不影响内容的字段
		delete normalizedContext.userId;
		delete normalizedContext.timestamp;
		delete normalizedContext.sessionId;

		return createHash('sha256').update(JSON.stringify(normalizedContext)).digest('hex');
	}

	// 检查精确缓存
	async checkExactCache(context: Record<string, any>): Promise<string | null> {
		const promptId = this.generatePromptId(context);
		const key = `${this.CACHE_NAMESPACE}:${promptId}`;
		return await this.redisService.get(key);
	}

	// 存储结果到缓存
	async storeToCache(
		context: Record<string, any>,
		result: string,
		ttlSeconds = 86400 // 默认缓存24小时
	): Promise<void> {
		const promptId = this.generatePromptId(context);
		const key = `${this.CACHE_NAMESPACE}:${promptId}`;

		// 1. 存储结果到redisService
		await this.redisService.set(key, result, ttlSeconds);

		// 2. 存储上下文映射，便于后续检索
		await this.redisService.set(`${key}:context`, JSON.stringify(context), ttlSeconds);

		// 3. 创建向量嵌入并存储到向量数据库
		try {
			const promptText = this.getPromptText(context);
			const doc = new Document({
				pageContent: promptText,
				metadata: {
					promptId,
					timestamp: Date.now()
				}
			});

			await this.vectorStoreService.addDocumentsToIndex(
				[doc],
				this.CACHE_INDEX,
				this.modelService.embedModel_openai
			);

			console.log(`Cached prompt ${promptId} successfully`);
		} catch (error) {
			console.error('Failed to store embedding:', error);
		}
	}

	// 从上下文中提取提示文本
	private getPromptText(context: Record<string, any>): string {
		// 假设context.input包含主要提示文本
		if (typeof context.input === 'string') {
			return context.input;
		}

		// 如果是复杂结构，尝试序列化关键部分
		return JSON.stringify({
			prompt: context.input,
			query: context.query,
			input: context.input
		});
	}

	// 查找相似的提示
	async findSimilarPrompts(
		context: Record<string, any>
	): Promise<Array<{ promptId: string; similarity: number }>> {
		try {
			const promptText = this.getPromptText(context);

			// 获取向量检索器
			const retriever = await this.vectorStoreService.getRetrieverOfIndex(
				this.CACHE_INDEX,
				this.modelService.embedModel_openai,
				3
			);

			// 检索相似文档
			const results = await retriever.getRelevantDocuments(promptText);

			return results.map(doc => ({
				promptId: doc.metadata.promptId,
				similarity: doc.metadata.score || 0
			}));
		} catch (error) {
			console.error('Error finding similar prompts:', error);
			return [];
		}
	}

	// 获取相似提示的缓存结果
	async getSimilarCacheResult(
		context: Record<string, any>
	): Promise<{ result: string; similarity: number } | null> {
		const similarPrompts = await this.findSimilarPrompts(context);

		for (const { promptId, similarity } of similarPrompts) {
			if (similarity >= this.SIMILARITY_THRESHOLD) {
				const cacheKey = `${this.CACHE_NAMESPACE}:${promptId}`;
				const result = await this.redisService.get(cacheKey);

				if (result) {
					return { result, similarity };
				}
			}
		}

		return null;
	}

	// 创建SSE流式响应（从缓存）
	createCachedResponse(result: string, exact = false): Observable<DataChunkVO> {
		return new Observable<DataChunkVO>(subscriber => {
			// 分割缓存结果以模拟流式传输
			const chunks = this.splitTextIntoChunks(result, 15);

			let delay = 0;
			const chunkDelay = 50; // 每个块的延迟毫秒数

			// 发送所有块，除了最后一个
			chunks.slice(0, -1).forEach((chunk, i) => {
				setTimeout(() => {
					subscriber.next({
						data: {
							content: chunk,
							done: false,
							cached: true,
							exact
						}
					});
				}, delay);
				delay += chunkDelay;
			});

			// 发送最后一个块并标记完成
			setTimeout(() => {
				subscriber.next({
					data: {
						content: chunks[chunks.length - 1],
						done: true,
						cached: true,
						exact
					}
				});
				subscriber.complete();
			}, delay);
		});
	}

	// 将文本分割成小块
	private splitTextIntoChunks(text: string, avgChunkSize: number): string[] {
		const chunks: string[] = [];
		let start = 0;

		while (start < text.length) {
			// 变化块大小，使响应更自然
			const variation = Math.floor(Math.random() * 10) - 5;
			const size = Math.max(5, avgChunkSize + variation);
			const end = Math.min(start + size, text.length);

			chunks.push(text.slice(start, end));
			start = end;
		}

		return chunks;
	}

	// 清理过期缓存
	async cleanupExpiredCache(): Promise<number> {
		let cleaned = 0;
		try {
			const keys = await this.redisService.keys(`${this.CACHE_NAMESPACE}:*`);

			for (const key of keys) {
				const ttl = await this.redisService.ttl(key);

				// 如果TTL小于等于0，表示已过期或没有设置过期时间
				if (ttl <= 0) {
					// 从redisService中删除
					await this.redisService.del(key);

					// 如果是主缓存键（不是上下文等附加信息）
					if (!key.includes(':context')) {
						const promptId = key.split(':')[2];

						//* 待实现：从向量数据库中移除
						// await this.vectorStoreService.removeDocument(this.CACHE_INDEX, promptId);

						cleaned++;
					}
				}
			}

			return cleaned;
		} catch (error) {
			console.error('Failed to clean expired cache:', error);
			return 0;
		}
	}
}
