/**
 * ResumeService 单元测试
 *
 * 测试覆盖的核心功能：
 * 1. 简历匹配任务执行
 * 2. 简历CRUD操作（创建、查询、更新、删除）
 * 3. 分页查询功能
 * 4. 简历与岗位匹配查询
 * 5. 错误处理和边界情况
 *
 * - 使用Jest mock模拟Mongoose模型
 * - 覆盖正常流程和异常情况
 * - 验证数据库操作的正确性
 * - 测试用户权限验证
 */

import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Observable, of } from 'rxjs';
import { Job } from '../../src/business/job/entities/job.entity';
import { JobService } from '../../src/business/job/job.service';
import { Project } from '../../src/business/project/entities/project.entity';
import { Resume } from '../../src/business/resume/entities/resume.entity';
import { ResumeMatched } from '../../src/business/resume/entities/resumeMatched.entity';
import { ResumeService } from '../../src/business/resume/resume.service';
import { Skill } from '../../src/business/skill/entities/skill.entity';
import { ChainService } from '../../src/chain/chain.service';
import { HjmChainService } from '../../src/chain/hjm-chain.service';
import { EventBusService } from '../../src/EventBus/event-bus.service';
import { RedisService } from '../../src/redis/redis.service';

const userInfo = { userId: 'user123', username: 'test', role: 'user', userConfig: {} as any };

describe('ResumeService', () => {
	let service: ResumeService;
	let resumeModel: any;
	let projectModel: any;
	let jobModel: any;
	let skillModel: any;
	let resumeMatchedModel: any;
	let chainService: any;
	let hjmChainService: any;
	let eventBusService: any;
	let redisService: any;
	let jobService: any;

	beforeEach(async () => {
		// Mock Mongoose models - 需要mock构造函数
		const mockResumeInstance = {
			save: jest.fn().mockResolvedValue({ _id: 'resume123', name: 'Test Resume' })
		};

		// 创建一个可调用的mock函数来模拟构造函数
		const mockResumeModel = jest.fn().mockImplementation(() => mockResumeInstance) as any;
		// 添加静态方法
		mockResumeModel.findOne = jest.fn();
		mockResumeModel.find = jest.fn();
		mockResumeModel.create = jest.fn();
		mockResumeModel.findOneAndUpdate = jest.fn();
		mockResumeModel.deleteOne = jest.fn();
		mockResumeModel.countDocuments = jest.fn();
		mockResumeModel.updateOne = jest.fn();

		resumeModel = mockResumeModel;

		projectModel = {
			findOne: jest.fn()
		};

		jobModel = {
			findOne: jest.fn(),
			updateOne: jest.fn()
		};

		skillModel = {
			findOne: jest.fn()
		};

		resumeMatchedModel = {
			findOne: jest.fn(),
			find: jest.fn(),
			findByIdAndUpdate: jest.fn(),
			save: jest.fn()
		};

		// Mock services
		chainService = {
			fomartFixChain: jest.fn().mockResolvedValue({
				invoke: jest.fn().mockResolvedValue({})
			})
		};

		hjmChainService = {
			matchChain: jest.fn().mockResolvedValue({
				stream: jest.fn().mockResolvedValue(of({ content: 'test', done: true }))
			})
		};

		eventBusService = {
			once: jest.fn(),
			emit: jest.fn()
		};

		redisService = {
			get: jest.fn().mockResolvedValue(JSON.stringify({ content: 'test result' }))
		};

		jobService = {
			findOne: jest.fn()
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResumeService,
				{ provide: getModelToken(Resume.name), useValue: resumeModel },
				{ provide: getModelToken(Project.name), useValue: projectModel },
				{ provide: getModelToken(Job.name), useValue: jobModel },
				{ provide: getModelToken(Skill.name), useValue: skillModel },
				{ provide: getModelToken(ResumeMatched.name), useValue: resumeMatchedModel },
				{ provide: ChainService, useValue: chainService },
				{ provide: HjmChainService, useValue: hjmChainService },
				{ provide: EventBusService, useValue: eventBusService },
				{ provide: RedisService, useValue: redisService },
				{ provide: JobService, useValue: jobService }
			]
		}).compile();

		service = module.get<ResumeService>(ResumeService);
	});

	it('应该被定义', () => {
		expect(service).toBeDefined();
	});

	it('应该正确初始化funcPool', () => {
		expect(service.funcPool.resumeMatchJob).toBeDefined();
		expect(service.poolName).toBe('ResumeService');
	});

	describe('resumeMatchJob', () => {
		const input = { resume: 'resume123', job: 'job123' };
		const taskId = 'task123';

		it('应该成功执行简历匹配任务', async () => {
			const mockResume = {
				id: 'resume123',
				name: 'Test Resume',
				skill: { name: 'JavaScript', content: 'Frontend skills' },
				projects: [{ info: { name: 'Project1' } }]
			};

			const mockJob = {
				id: 'job123',
				jobName: 'Frontend Developer',
				companyName: 'Test Company',
				description: 'Job description'
			};

			service.findOne = jest.fn().mockResolvedValue(mockResume);
			jobService.findOne.mockResolvedValue(mockJob);

			const result = await service.resumeMatchJob(
				input,
				userInfo,
				taskId,
				{ reflect: false, content: '' },
				'deepseek' as any
			);

			expect(result).toBeInstanceOf(Observable);
			expect(hjmChainService.matchChain).toHaveBeenCalledWith(true, 'deepseek');
		});
	});

	describe('create', () => {
		const createResumeDto = {
			name: 'Test Resume',
			skill: '507f1f77bcf86cd799439011', // 有效的ObjectId
			projects: ['507f1f77bcf86cd799439012'] // 有效的ObjectId
		};

		it('应该成功创建简历', async () => {
			const mockResume = {
				...createResumeDto,
				_id: 'resume123',
				userInfo,
				status: 'committed',
				save: jest.fn().mockResolvedValue({ _id: 'resume123', name: 'Test Resume' })
			};

			// Mock构造函数返回实例
			(resumeModel as any).mockReturnValue(mockResume);

			const result = await service.create(createResumeDto, userInfo);

			expect(resumeModel).toHaveBeenCalledWith({
				...createResumeDto,
				skill: expect.any(Types.ObjectId),
				projects: [expect.any(Types.ObjectId)],
				userInfo,
				status: 'committed'
			});
		});
	});

	describe('findAll', () => {
		it('应该返回分页的简历列表', async () => {
			const mockResumes = [
				{ _id: 'resume1', name: 'Resume 1' },
				{ _id: 'resume2', name: 'Resume 2' }
			];

			resumeModel.find.mockReturnValue({
				skip: jest.fn().mockReturnValue({
					limit: jest.fn().mockReturnValue({
						sort: jest.fn().mockReturnValue({
							exec: jest.fn().mockResolvedValue(mockResumes)
						})
					})
				})
			});

			resumeModel.countDocuments.mockReturnValue({
				exec: jest.fn().mockResolvedValue(2)
			});

			service.findOne = jest.fn().mockResolvedValue({ id: 'resume1', name: 'Resume 1' });

			const result = await service.findAll(userInfo, 1, 10);

			expect(result.data).toHaveLength(2);
			expect(result.total).toBe(2);
			expect(result.page).toBe(1);
			expect(result.limit).toBe(10);
		});
	});

	describe('findOne', () => {
		const resumeId = '507f1f77bcf86cd799439011'; // 有效的ObjectId

		it('当ID格式无效时应抛出错误', async () => {
			await expect(service.findOne('invalid-id', userInfo)).rejects.toThrow(
				'Invalid ID format: "invalid-id"'
			);
		});

		it('当简历不存在时应抛出错误', async () => {
			resumeModel.findOne.mockReturnValue({
				populate: jest.fn().mockReturnValue({
					populate: jest.fn().mockReturnValue({
						exec: jest.fn().mockResolvedValue(null)
					})
				})
			});

			await expect(service.findOne(resumeId, userInfo)).rejects.toThrow(
				'Resume with ID "507f1f77bcf86cd799439011" not found or access denied'
			);
		});

		it('应该成功返回简历', async () => {
			const mockResume = {
				_id: resumeId,
				name: 'Test Resume',
				userInfo: { userId: 'user123' },
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue({
					_id: resumeId,
					name: 'Test Resume',
					userInfo: { userId: 'user123' }
				})
			};

			resumeModel.findOne.mockReturnValue(mockResume);

			const result = await service.findOne(resumeId, userInfo);

			expect(result).toBeDefined();
			expect(resumeModel.findOne).toHaveBeenCalledWith({
				_id: expect.any(Types.ObjectId),
				'userInfo.userId': userInfo.userId
			});
		});
	});

	describe('update', () => {
		const resumeId = '507f1f77bcf86cd799439011'; // 有效的ObjectId
		const updateResumeDto = { name: 'Updated Resume' };

		it('当ID格式无效时应抛出错误', async () => {
			await expect(service.update('invalid-id', updateResumeDto, userInfo)).rejects.toThrow(
				'Invalid ID format: "invalid-id"'
			);
		});

		it('应该成功更新简历', async () => {
			const mockResume = {
				_id: resumeId,
				name: 'Updated Resume',
				userInfo: { userId: 'user123' }
			};

			resumeModel.findOneAndUpdate.mockReturnValue({
				exec: jest.fn().mockResolvedValue(mockResume)
			});
			service.findOne = jest.fn().mockResolvedValue(mockResume);

			const result = await service.update(resumeId, updateResumeDto, userInfo);

			expect(result).toBeDefined();
			expect(resumeModel.findOneAndUpdate).toHaveBeenCalledWith(
				{ _id: expect.any(Types.ObjectId), 'userInfo.userId': userInfo.userId },
				updateResumeDto,
				{ new: true }
			);
		});
	});

	describe('remove', () => {
		const resumeId = '507f1f77bcf86cd799439011'; // 有效的ObjectId

		it('当ID格式无效时应抛出错误', async () => {
			await expect(service.remove('invalid-id', userInfo)).rejects.toThrow(
				'Invalid ID format: "invalid-id"'
			);
		});

		it('应该成功删除简历', async () => {
			resumeModel.deleteOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue({ deletedCount: 1 })
			});

			const result = await service.remove(resumeId, userInfo);

			expect(result).toBe(void 0);
			expect(resumeModel.deleteOne).toHaveBeenCalledWith({
				_id: expect.any(Types.ObjectId),
				'userInfo.userId': userInfo.userId
			});
		});

		it('当简历不存在时应抛出错误', async () => {
			resumeModel.deleteOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue({ deletedCount: 0 })
			});

			await expect(service.remove(resumeId, userInfo)).rejects.toThrow(
				'Resume with ID "507f1f77bcf86cd799439011" not found or access denied'
			);
		});
	});

	describe('findResumeMatchedByJobId', () => {
		const jobId = '507f1f77bcf86cd799439011'; // 有效的ObjectId

		it('当简历不存在时应抛出错误', async () => {
			resumeMatchedModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null)
			});

			await expect(service.findResumeMatchedByJobId(jobId)).rejects.toThrow(
				'Resume matched with jobId "507f1f77bcf86cd799439011" not found'
			);
		});

		it('应该成功返回匹配的简历', async () => {
			const mockResumeMatched = {
				id: 'resume123',
				name: 'Matched Resume',
				status: 'matched',
				skill: { name: 'JavaScript' },
				projects: [{ info: { name: 'Project1' } }],
				createdAt: new Date(),
				updatedAt: new Date(),
				toObject: jest.fn().mockReturnValue({
					id: 'resume123',
					name: 'Matched Resume',
					status: 'matched',
					skill: { name: 'JavaScript' },
					projects: [{ info: { name: 'Project1' } }],
					createdAt: new Date(),
					updatedAt: new Date()
				})
			};

			resumeMatchedModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(mockResumeMatched)
			});

			const result = await service.findResumeMatchedByJobId(jobId);

			expect(result.id).toBe('resume123');
			expect(result.name).toBe('Matched Resume');
		});
	});
});
