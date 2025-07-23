import { Test, TestingModule } from '@nestjs/testing';
import { ChainService } from '../../chain/chain.service';
import { DbService } from '../../DB/db.service';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { InterviewSummaryService } from './interview-summary.service';

/**
 * interview-summary.service.ts的单元测试
 * 测试面经的导入、处理、共享功能
 */

// Mock AI Chain的返回数据
const mockGenerateChainOutput = {
	questions: ['问题1？', '问题2？']
};
const mockTransformChainOutput1 = {
	title: '问题1？',
	content: '这是问题1的答案。',
	gist: '问题1的核心摘要。',
	content_mindmap: '# 问题1',
	hard: '2.5',
	link: 'https://pinkprisma/question/uuid-1',
	quiz_type: '问答题',
	content_type: 'javascript',
	job_type: '前端'
};
const mockTransformChainOutput2 = {
	title: '问题2？',
	content: '这是问题2的答案。',
	gist: '问题2的核心摘要。',
	content_mindmap: '# 问题2',
	hard: '3.0',
	link: 'https://pinkprisma/question/uuid-2',
	quiz_type: '问答题',
	content_type: 'typescript',
	job_type: '前端'
};

describe('InterviewSummaryService', () => {
	let service: InterviewSummaryService;
	let dbService: DbService;
	let taskQueueService: TaskQueueService;
	let chainService: ChainService;

	// 用于存储任务处理器的伪实现
	let taskHandler: (task: any) => Promise<void>;

	beforeEach(async () => {
		// 创建一个模拟的DbService
		const mockDbService = {
			interview_summary: {
				findFirst: jest.fn(),
				create: jest.fn(),
				findUnique: jest.fn(),
				findMany: jest.fn()
			},
			article: {
				findFirst: jest.fn(),
				create: jest.fn(),
				// mock 用到的 distinct 查询
				findMany: jest.fn().mockImplementation(async (field, job_type) => {
					if (job_type) {
						return [
							{ content_type: 'javascript' },
							{ content_type: 'css' },
							{ content_type: 'html' }
						];
					} else {
						return [{ job_type: '前端' }, { job_type: '后端' }];
					}
				})
			}
		};
		// 创建一个模拟的TaskQueueService
		const mockTaskQueueService = {
			createAndEnqueueTask: jest.fn(),
			registerTaskHandler: jest.fn().mockImplementation((type, handler) => {
				taskHandler = handler; // 捕获注册的处理器
			})
		};
		// 创建一个模拟的ChainService
		const mockChainService = {
			createInterviewSummaryGenerateChain: jest.fn().mockResolvedValue({
				invoke: jest.fn().mockResolvedValue(mockGenerateChainOutput)
			}),
			createInterviewSummaryTransformChain: jest.fn().mockResolvedValue({
				invoke: jest.fn().mockImplementation(input => {
					if (input.input === '问题1？') {
						return Promise.resolve(mockTransformChainOutput1);
					}
					return Promise.resolve(mockTransformChainOutput2);
				})
			})
		};
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				InterviewSummaryService,
				{ provide: DbService, useValue: mockDbService },
				{ provide: TaskQueueService, useValue: mockTaskQueueService },
				{ provide: ChainService, useValue: mockChainService }
			]
		}).compile();

		service = module.get<InterviewSummaryService>(InterviewSummaryService);
		dbService = module.get<DbService>(DbService);
		taskQueueService = module.get<TaskQueueService>(TaskQueueService);
		chainService = module.get<ChainService>(ChainService);

		// 在每个测试用例开始前，调用onModuleInit来注册任务处理器
		service.onModuleInit();
	});

	it('应该被定义', () => {
		expect(service).toBeDefined();
	});

	describe('获取字段取值', () => {
		it('应该能成功获取面经表和面试题表字段的取值', async () => {
			const result = await service.getFinalFieldEnum();
			expect(result).toMatchObject({
				interview_summary: {
					interview_type: expect.any(Array),
					job_type: expect.any(Array),
					company_scale: expect.any(Array)
				},
				article: {
					quiz_type: expect.any(Array),
					job_type: expect.any(Array),
					content_type: {
						前端: expect.any(Array),
						后端: expect.any(Array)
					}
				}
			});
		});
	});

	describe('面经创建和处理流程', () => {
		const userId = 1;
		const userInfo = {
			userId: userId.toString(),
			username: 'test'
		};
		const summaryData = {
			content: '这是一份面经内容',
			job_type: '前端',
			own: true
		};
		const createdSummary = {
			id: 101,
			user_id: userId,
			...summaryData,
			company_name: null,
			turn: null
		};

		it('应该成功创建面经并触发后台任务', async () => {
			// 模拟数据库中不存在此面经
			(dbService.interview_summary.findFirst as jest.Mock).mockResolvedValue(null);
			// 模拟创建成功后的返回
			(dbService.interview_summary.create as jest.Mock).mockResolvedValue(createdSummary);

			const result = await service.createInterviewSummary(summaryData, userInfo);

			expect(result).toEqual(createdSummary);
			expect(dbService.interview_summary.create).toHaveBeenCalled();
			expect(taskQueueService.createAndEnqueueTask).toHaveBeenCalledWith(
				createdSummary.id.toString(),
				userId.toString(),
				'interview-summary-process',
				{ interviewSummaryId: createdSummary.id }
			);
		});

		it('当面经已存在时不应创建并应抛出错误', async () => {
			// 模拟数据库中已存在此面经
			(dbService.interview_summary.findFirst as jest.Mock).mockResolvedValue(createdSummary);

			await expect(service.createInterviewSummary(summaryData, userInfo)).rejects.toThrow(
				'面经已存在'
			);
		});

		it('后台任务应该成功处理面经，转换并存储面试题', async () => {
			// 模拟后台任务的输入
			const task = { metadata: { interviewSummaryId: createdSummary.id } };

			// 模拟从数据库获取面经
			(dbService.interview_summary.findUnique as jest.Mock).mockResolvedValue(createdSummary);
			// 模拟数据库中不存在任何相关面试题
			(dbService.article.findFirst as jest.Mock).mockResolvedValue(null);

			// 执行被注册的任务处理器
			await taskHandler(task);

			// 验证AI chain是否被调用
			expect(chainService.createInterviewSummaryGenerateChain).toHaveBeenCalled();
			expect(chainService.createInterviewSummaryTransformChain).toHaveBeenCalled();

			// 验证面试题是否被正确创建
			// 应该为问题清单中的每个问题都调用一次创建
			expect(dbService.article.create).toHaveBeenCalledTimes(
				mockGenerateChainOutput.questions.length
			);
		});
	});

	describe('面经导入流程', () => {
		const exporterId = 1;
		const importerId = 2;

		const exporterSummary1 = {
			id: 201,
			user_id: exporterId,
			content: '导出者的面经1',
			content_hash: 'hash1',
			post_link: 'link1',
			job_type: '后端'
		};
		const exporterSummary2 = {
			id: 202,
			user_id: exporterId,
			content: '导出者的面经2',
			content_hash: 'hash2',
			post_link: 'link2',
			job_type: '后端'
		};

		const articleForSummary1 = {
			id: 301,
			interview_summary_id: exporterSummary1.id,
			user_id: exporterId,
			link: 'article-link-1',
			title: '文章1'
		};
		const articleForSummary2 = {
			id: 302,
			interview_summary_id: exporterSummary2.id,
			user_id: exporterId,
			link: 'article-link-2',
			title: '文章2'
		};

		it('应该能成功导入一个用户的所有面经和面试题', async () => {
			// 模拟导出者有两条面经
			(dbService.interview_summary.findMany as jest.Mock).mockResolvedValue([
				exporterSummary1,
				exporterSummary2
			]);
			// 模拟导入者没有任何面经或面试题
			(dbService.interview_summary.findFirst as jest.Mock).mockResolvedValue(null);
			(dbService.article.findFirst as jest.Mock).mockResolvedValue(null);
			// 模拟与面经关联的面试题
			(dbService.article.findMany as jest.Mock)
				.mockResolvedValueOnce([articleForSummary1])
				.mockResolvedValueOnce([articleForSummary2]);

			// 模拟创建新面经的返回值
			const newSummary1 = { ...exporterSummary1, id: 401, user_id: importerId };
			const newSummary2 = { ...exporterSummary2, id: 402, user_id: importerId };
			(dbService.interview_summary.create as jest.Mock)
				.mockResolvedValueOnce(newSummary1)
				.mockResolvedValueOnce(newSummary2);

			await service.importSummariesAndArticles(exporterId, importerId);

			// 应该为每条面经都调用一次创建
			expect(dbService.interview_summary.create).toHaveBeenCalledTimes(2);
			// 应该为每篇文章都调用一次创建
			expect(dbService.article.create).toHaveBeenCalledTimes(2);

			// 验证第二篇导入的文章是否正确关联了新的面经ID
			const {
				id: oldArticleId,
				user_id: oldArticleUserId,
				interview_summary_id: oldInterviewSummaryId,
				...articleData
			} = articleForSummary2;
			expect(dbService.article.create).toHaveBeenCalledWith({
				data: {
					...articleData,
					user_id: importerId,
					interview_summary_id: newSummary2.id // 验证关联
				}
			});
		});

		it('应该能正确处理去重，只导入不存在的面经和面试题', async () => {
			// 模拟导出者有两条面经
			(dbService.interview_summary.findMany as jest.Mock).mockResolvedValue([
				exporterSummary1,
				exporterSummary2
			]);
			// 模拟导入者已拥有第一条面经，但没有第二条
			(dbService.interview_summary.findFirst as jest.Mock)
				.mockResolvedValueOnce(exporterSummary1) // 第一次查询返回已存在
				.mockResolvedValueOnce(null); // 第二次查询返回不存在

			// 模拟导入者已拥有与第二条面经关联的面试题
			(dbService.article.findFirst as jest.Mock).mockResolvedValue(articleForSummary2);

			// 模拟与第二条面经关联的面试题
			(dbService.article.findMany as jest.Mock).mockResolvedValue([articleForSummary2]);

			await service.importSummariesAndArticles(exporterId, importerId);

			// 只应创建一条新的面经（第二条）
			expect(dbService.interview_summary.create).toHaveBeenCalledTimes(1);
			// 不应创建任何新的面试题，因为导入者已存在
			expect(dbService.article.create).not.toHaveBeenCalled();
		});
	});
});
