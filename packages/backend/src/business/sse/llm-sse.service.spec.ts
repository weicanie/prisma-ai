/**
 * LLMSseService 单元测试
 *
 * 测试覆盖的核心功能：
 * 1. 服务初始化和任务处理器注册
 * 2. SSE请求处理和响应流程
 * 3. 断点接传功能
 * 4. 事件数据保存和Redis缓存
 * 5. 错误处理和边界情况
 *
 * - 使用Jest mock模拟所有外部依赖
 * - 覆盖正常流程和异常情况
 * - 验证事件发射和Redis操作
 * - 测试Observable流的正确性
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SelectedLLM } from '@prisma-ai/shared';
import { Observable, of } from 'rxjs';
import { EventBusService, EventList } from '../../EventBus/event-bus.service';
import { RedisService } from '../../redis/redis.service';
import { LLMSseSessionPoolService } from '../../session/llm-sse-session-pool.service';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { TaskStatus } from '../../type/taskqueue';
import { LLMStreamingChunk } from '../../utils/type';
import { LLMSseService } from './llm-sse.service';
describe('LLMSseService', () => {
	let service: LLMSseService;
	let taskQueueService: any;
	let eventBusService: any;
	let redisService: any;
	let sessionPool: any;
	let llmCache: any;
	let withFuncPoolProjectProcess: any;
	let withFuncPoolResumeService: any;

	beforeEach(async () => {
		// Mock 依赖服务
		taskQueueService = {
			registerTaskHandler: jest.fn(),
			createAndEnqueueTask: jest.fn(),
			getSessionTaskId: jest.fn(),
			getTask: jest.fn(),
			saveTask: jest.fn(),
			PREFIX: { RESULT: 'task_result:' }
		};

		eventBusService = {
			emit: jest.fn(),
			on: jest.fn()
		};

		redisService = {
			set: jest.fn().mockResolvedValue(1),
			get: jest.fn().mockResolvedValue(null)
		};

		sessionPool = {
			getContext: jest.fn(),
			getSession: jest.fn(),
			delUserSessionId: jest.fn(),
			setBackendDone: jest.fn()
		};

		llmCache = {
			checkExactCache: jest.fn(),
			getSimilarCacheResult: jest.fn(),
			createCachedResponse: jest.fn()
		};

		withFuncPoolProjectProcess = {
			poolName: 'ProjectProcessService',
			funcPool: {
				lookupProject: jest.fn().mockResolvedValue(of({ content: 'test', done: true }))
			}
		};

		withFuncPoolResumeService = {
			poolName: 'ResumeService',
			funcPool: {
				resumeMatchJob: jest.fn().mockResolvedValue(of({ content: 'test', done: true }))
			}
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LLMSseService,
				{ provide: TaskQueueService, useValue: taskQueueService },
				{ provide: EventBusService, useValue: eventBusService },
				{ provide: RedisService, useValue: redisService },
				{ provide: LLMSseSessionPoolService, useValue: sessionPool },
				{ provide: 'WithFuncPoolProjectProcess', useValue: withFuncPoolProjectProcess },
				{ provide: 'WithFuncPoolResumeService', useValue: withFuncPoolResumeService }
			]
		}).compile();

		service = module.get<LLMSseService>(LLMSseService);
	});

	it('应该被定义', () => {
		expect(service).toBeDefined();
	});

	it('应该在初始化时注册任务处理器', () => {
		expect(taskQueueService.registerTaskHandler).toHaveBeenCalledWith(
			'sse_llm',
			expect.any(Function)
		);
	});

	it('应该在onModuleInit中注册pools', () => {
		service.onModuleInit();
		expect(service.pools['ProjectProcessService']).toBe(withFuncPoolProjectProcess);
		expect(service.pools['ResumeService']).toBe(withFuncPoolResumeService);
	});

	describe('handleSseRequestAndResponse', () => {
		const sessionId = 'session123';
		const userInfo = { userId: 'user123', username: 'test' };
		const metadata = {
			funcKey: 'lookupProject',
			poolName: 'ProjectProcessService',
			model: SelectedLLM.deepseek_reasoner
		};

		it('当会话不存在时应返回错误', async () => {
			sessionPool.getSession.mockResolvedValue(null);

			const result = await service.handleSseRequestAndResponse(sessionId, userInfo, metadata);

			//@ts-ignore
			result.subscribe(chunk => {
				expect(chunk.data.error).toBe('用户sse会话不存在，请先创建会话');
				expect(chunk.data.done).toBe(true);
			});
		});

		it('当会话任务已存在时应返回错误', async () => {
			sessionPool.getSession.mockResolvedValue({ id: sessionId });
			taskQueueService.getSessionTaskId.mockResolvedValue('task123');
			taskQueueService.getTask.mockResolvedValue({
				id: 'task123',
				status: TaskStatus.RUNNING
			});

			const result = await service.handleSseRequestAndResponse(sessionId, userInfo, metadata);
			//@ts-ignore
			result.subscribe(chunk => {
				expect(chunk.data.error).toBe('用户sse会话已存在,请请求断点接传接口');
				expect(chunk.data.done).toBe(true);
			});
		});

		it('当上下文不完整时应返回错误', async () => {
			sessionPool.getSession.mockResolvedValue({ id: sessionId });
			taskQueueService.getSessionTaskId.mockResolvedValue(null);
			sessionPool.getContext.mockResolvedValue(null);

			const result = await service.handleSseRequestAndResponse(sessionId, userInfo, metadata);
			//@ts-ignore
			result.subscribe(chunk => {
				expect(chunk.data.error).toBe('用户sse上下文不完整');
				expect(chunk.data.done).toBe(true);
			});
		});

		it('应该成功创建任务并返回Observable', async () => {
			sessionPool.getSession.mockResolvedValue({ id: sessionId });
			taskQueueService.getSessionTaskId.mockResolvedValue(null);
			sessionPool.getContext.mockResolvedValue({
				input: { test: 'data' },
				userInfo
			});
			taskQueueService.createAndEnqueueTask.mockResolvedValue({
				id: 'task123',
				status: TaskStatus.PENDING
			});

			const result = await service.handleSseRequestAndResponse(sessionId, userInfo, metadata);

			expect(taskQueueService.createAndEnqueueTask).toHaveBeenCalledWith(
				sessionId,
				userInfo.userId,
				'sse_llm',
				metadata
			);
			expect(result).toBeInstanceOf(Observable);
		});
	});

	describe('handleSseRequestAndResponseRecover', () => {
		const sessionId = 'session123';
		const userInfo = { userId: 'user123', username: 'test' };

		it('当会话不存在时应返回错误', async () => {
			sessionPool.getSession.mockResolvedValue(null);

			const result = await service.handleSseRequestAndResponseRecover(sessionId, userInfo);
			//@ts-ignore
			result.subscribe(chunk => {
				expect(chunk.data.error).toBe('用户sse会话不存在，请先创建会话');
				expect(chunk.data.done).toBe(true);
			});
		});

		it('当任务不存在时应返回错误', async () => {
			sessionPool.getSession.mockResolvedValue({ id: sessionId });
			sessionPool.getContext.mockResolvedValue({ input: { test: 'data' } });
			taskQueueService.getSessionTaskId.mockResolvedValue(null);

			const result = await service.handleSseRequestAndResponseRecover(sessionId, userInfo);
			//@ts-ignore
			result.subscribe(chunk => {
				expect(chunk.data.error).toBe('用户sse任务不存在，请先创建会话');
				expect(chunk.data.done).toBe(true);
			});
		});

		it('当会话已完成时应返回缓存结果', async () => {
			sessionPool.getSession.mockResolvedValue({ id: sessionId, done: true });
			sessionPool.getContext.mockResolvedValue({ input: { test: 'data' } });
			taskQueueService.getSessionTaskId.mockResolvedValue('task123');

			// Mock chunkArrayPool
			service.chunkArrayPool['task123'] = [
				{ content: 'test content', done: true, isReasoning: false }
			];

			const result = await service.handleSseRequestAndResponseRecover(sessionId, userInfo);
			//@ts-ignore
			result.subscribe(chunk => {
				expect(chunk.data.content).toBe('test content');
				expect(chunk.data.done).toBe(true);
			});
		});
	});

	describe('saveSseEventData', () => {
		it('应该正确保存chunk并触发事件', async () => {
			const taskId = 'task123';
			const chunk: LLMStreamingChunk = {
				content: 'test content',
				done: false,
				isReasoning: false
			};

			taskQueueService.getTask.mockResolvedValue({
				id: taskId,
				status: TaskStatus.RUNNING
			});

			await service['saveSseEventData'](taskId, chunk);

			expect(eventBusService.emit).toHaveBeenCalledWith(EventList.chunkGenerated, {
				taskId,
				eventData: chunk
			});
			expect(service.chunkArrayPool[taskId]).toContain(chunk);
		});

		it('当chunk完成时应保存结果到Redis', async () => {
			const taskId = 'task123';
			const chunk: LLMStreamingChunk = {
				content: 'final content',
				done: true,
				isReasoning: false
			};

			taskQueueService.getTask.mockResolvedValue({
				id: taskId,
				status: TaskStatus.RUNNING
			});

			// 先添加一些chunks
			service.chunkArrayPool[taskId] = [
				{ content: 'content1', done: false, isReasoning: false },
				{ content: 'content2', done: false, isReasoning: false }
			];

			await service['saveSseEventData'](taskId, chunk);

			expect(redisService.set).toHaveBeenCalledWith(
				'task_result:task123',
				expect.stringContaining('content1content2final content'),
				24 * 60 * 60
			);
			expect(service.chunkArrayPool[taskId]).toBeUndefined(); // 应该被清理
		});
	});
});
