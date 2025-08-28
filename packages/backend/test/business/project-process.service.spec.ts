/**
 * ProjectProcessService 单元测试
 *
 * 测试覆盖的核心功能：
 * 1. 项目文本转换和验证
 * 2. 项目分析任务（lookupProject）
 * 3. 项目打磨任务（polishProject）
 * 4. 项目挖掘任务（mineProject）
 * 5. 结果处理器创建
 * 6. 错误处理和边界情况
 *
 * - 使用Jest mock模拟Mongoose模型和Chain服务
 * - 覆盖正常流程和异常情况
 * - 验证项目数据结构的正确性
 * - 测试任务执行和事件处理
 */

import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Observable, of } from 'rxjs';
import { Project } from '../../src/business/project/entities/project.entity';
import { ProjectMined } from '../../src/business/project/entities/projectMined.entity';
import { ProjectPolished } from '../../src/business/project/entities/projectPolished.entity';
import { ProjectProcessService } from '../../src/business/project/project-process.service';
import { SkillService } from '../../src/business/skill/skill.service';
import { ChainService } from '../../src/chain/chain.service';
import { ProjectChainService } from '../../src/chain/project-chain.service';
import { EventBusService } from '../../src/EventBus/event-bus.service';
import { RedisService } from '../../src/redis/redis.service';

describe('ProjectProcessService', () => {
	let service: ProjectProcessService;
	let projectModel: any;
	let projectMinedModel: any;
	let projectPolishedModel: any;
	let chainService: any;
	let projectChainService: any;
	let eventBusService: any;
	let redisService: any;
	let skillService: any;

	beforeEach(async () => {
		// Mock Mongoose models - 需要mock构造函数
		const mockProjectInstance = {
			save: jest.fn().mockResolvedValue(true),
			toObject: jest.fn().mockReturnValue({ _id: 'project123', name: 'Test Project' })
		};

		// 创建一个可调用的mock函数来模拟构造函数
		const mockProjectModel = jest.fn().mockImplementation(() => mockProjectInstance) as any;
		// 添加静态方法
		mockProjectModel.findOne = jest.fn();
		mockProjectModel.updateOne = jest.fn();
		mockProjectModel.create = jest.fn();

		projectModel = mockProjectModel;

		projectMinedModel = {
			findOne: jest.fn(),
			deleteOne: jest.fn(),
			save: jest.fn()
		};

		projectPolishedModel = {
			findOne: jest.fn(),
			deleteOne: jest.fn(),
			save: jest.fn()
		};

		// Mock services
		chainService = {
			tansformChain: jest.fn().mockResolvedValue({
				invoke: jest.fn().mockResolvedValue({
					info: {
						name: 'Test Project',
						desc: { role: 'Developer', contribute: 'Core', bgAndTarget: 'Background' },
						techStack: ['JavaScript', 'React']
					},
					lightspot: { user: ['User1'], team: ['Team1'], skill: ['Skill1'] }
				})
			}),
			fomartFixChain: jest.fn().mockResolvedValue({
				invoke: jest.fn().mockResolvedValue({})
			})
		};

		projectChainService = {
			lookupChain: jest.fn().mockResolvedValue({
				stream: jest.fn().mockResolvedValue(of({ content: 'test', done: true }))
			}),
			polishChain: jest.fn().mockResolvedValue({
				stream: jest.fn().mockResolvedValue(of({ content: 'test', done: true }))
			}),
			mineChain: jest.fn().mockResolvedValue({
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

		skillService = {
			findAll: jest.fn().mockResolvedValue([])
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProjectProcessService,
				{ provide: getModelToken(Project.name), useValue: projectModel },
				{ provide: getModelToken(ProjectMined.name), useValue: projectMinedModel },
				{ provide: getModelToken(ProjectPolished.name), useValue: projectPolishedModel },
				{ provide: ChainService, useValue: chainService },
				{ provide: ProjectChainService, useValue: projectChainService },
				{ provide: EventBusService, useValue: eventBusService },
				{ provide: RedisService, useValue: redisService },
				{ provide: SkillService, useValue: skillService }
			]
		}).compile();

		service = module.get<ProjectProcessService>(ProjectProcessService);
	});

	it('应该被定义', () => {
		expect(service).toBeDefined();
	});

	it('应该正确初始化funcPool', () => {
		expect(service.funcPool.polishProject).toBeDefined();
		expect(service.funcPool.mineProject).toBeDefined();
		expect(service.funcPool.lookupProject).toBeDefined();
		expect(service.poolName).toBe('ProjectProcessService');
	});

	describe('transformAndCheckProject', () => {
		const projectText = '这是一个测试项目';
		const userInfo = { userId: 'user123', username: 'test' };

		it('应该成功转换和检查项目', async () => {
			const mockProject = {
				info: {
					name: 'Test Project',
					desc: { role: 'Developer', contribute: 'Core', bgAndTarget: 'Background' },
					techStack: ['JavaScript', 'React']
				},
				lightspot: { user: ['User1'], team: ['Team1'], skill: ['Skill1'] },
				status: 'committed',
				userInfo
			};

			// Mock checkoutProject方法
			service.checkoutProject = jest.fn().mockResolvedValue(mockProject);

			const result = await service.transformAndCheckProject(projectText, userInfo);

			expect(chainService.tansformChain).toHaveBeenCalled();
			expect(service.checkoutProject).toHaveBeenCalled();
			expect(result).toBeDefined();
		});
	});

	describe('checkoutProject', () => {
		const userInfo = { userId: 'user123', username: 'test' };
		const project = {
			info: {
				name: 'Test Project',
				desc: { role: 'Developer', contribute: 'Core', bgAndTarget: 'Background' },
				techStack: ['JavaScript', 'React']
			},
			lightspot: { user: ['User1'], team: ['Team1'], skill: ['Skill1'] },
			status: 'committed'
		};

		it('当项目名称已存在时应抛出错误', async () => {
			projectModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue({ info: { name: 'Test Project' } })
			});

			await expect(service.checkoutProject(project, userInfo)).rejects.toThrow(
				'项目名称为 Test Project 的项目经验已存在，请修改项目名称后重新提交。'
			);
		});

		it('应该成功检查并保存项目', async () => {
			projectModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null)
			});
			const mockProject = {
				...project,
				_id: 'project123',
				userInfo,
				status: 'committed',
				save: jest.fn().mockResolvedValue(true),
				toObject: jest.fn().mockReturnValue({ ...project, _id: 'project123' })
			};

			// Mock构造函数返回实例
			(projectModel as any).mockReturnValue(mockProject);

			const result = await service.checkoutProject(project, userInfo);

			expect(result).toBeDefined();
		});
	});

	describe('lookupProject', () => {
		const userInfo = { userId: 'user123', username: 'test' };
		const project = {
			info: {
				name: 'Test Project',
				desc: { role: 'Developer', contribute: 'Core', bgAndTarget: 'Background' },
				techStack: ['JavaScript', 'React']
			},
			lightspot: { user: ['User1'], team: ['Team1'], skill: ['Skill1'] }
		};
		const taskId = 'task123';

		it('应该成功执行项目分析任务', async () => {
			projectPolishedModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null)
			});
			projectPolishedModel.deleteOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue({ deletedCount: 0 })
			});

			const result = await service.lookupProject(
				project,
				userInfo,
				taskId,
				{ reflect: false, content: '' },
				'deepseek' as any
			);

			expect(result).toBeInstanceOf(Observable);
			expect(projectChainService.lookupChain).toHaveBeenCalledWith(true, 'deepseek');
		});

		it('当存在已打磨项目时应删除旧记录', async () => {
			const existingProject = { _id: 'existing123' };
			projectPolishedModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(existingProject)
			});
			projectPolishedModel.deleteOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue({ deletedCount: 1 })
			});

			await service.lookupProject(
				project,
				userInfo,
				taskId,
				{ reflect: false, content: '' },
				'deepseek' as any
			);

			expect(projectPolishedModel.deleteOne).toHaveBeenCalledWith({ _id: 'existing123' });
		});
	});

	describe('polishProject', () => {
		const userInfo = { userId: 'user123', username: 'test' };
		const project = {
			info: {
				name: 'Test Project',
				desc: { role: 'Developer', contribute: 'Core', bgAndTarget: 'Background' },
				techStack: ['JavaScript', 'React']
			},
			lightspot: { user: ['User1'], team: ['Team1'], skill: ['Skill1'] },
			lookupResult: { problem: [], solution: [], score: 85 }
		};
		const taskId = 'task123';

		it('当存在已打磨项目且无反馈时应直接返回', async () => {
			const existingProject = { _id: 'existing123', info: { name: 'Test Project' } };
			projectPolishedModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(existingProject)
			});
			projectModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(existingProject)
			});

			const result = await service.polishProject(
				project,
				userInfo,
				taskId,
				{ reflect: false, content: '' },
				'deepseek' as any
			);

			expect(result).toBeInstanceOf(Observable);
		});

		it('当存在已打磨项目且有反馈时应删除旧记录', async () => {
			const existingProject = { _id: 'existing123' };
			projectPolishedModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(existingProject)
			});
			projectModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(existingProject)
			});
			projectPolishedModel.deleteOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue({ deletedCount: 1 })
			});

			const result = await service.polishProject(
				project,
				userInfo,
				taskId,
				{ reflect: true, content: '重新打磨' },
				'deepseek' as any
			);

			expect(projectPolishedModel.deleteOne).toHaveBeenCalledWith({ _id: 'existing123' });
			expect(result).toBeInstanceOf(Observable);
		});

		it('应该成功执行项目打磨任务', async () => {
			projectPolishedModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null)
			});
			projectModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue({ _id: 'project123' })
			});

			const result = await service.polishProject(
				project,
				userInfo,
				taskId,
				{ reflect: false, content: '' },
				'deepseek' as any
			);

			expect(result).toBeInstanceOf(Observable);
			expect(projectChainService.polishChain).toHaveBeenCalledWith(true, 'deepseek');
		});
	});

	describe('mineProject', () => {
		const userInfo = { userId: 'user123', username: 'test' };
		const project = {
			info: {
				name: 'Test Project',
				desc: { role: 'Developer', contribute: 'Core', bgAndTarget: 'Background' },
				techStack: ['JavaScript', 'React']
			},
			lightspot: { user: ['User1'], team: ['Team1'], skill: ['Skill1'] }
		};
		const taskId = 'task123';

		it('当存在已挖掘项目时应删除旧记录', async () => {
			const existingProject = { _id: 'existing123' };
			projectMinedModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(existingProject)
			});
			projectMinedModel.deleteOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue({ deletedCount: 1 })
			});
			projectModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue({ _id: 'project123' })
			});

			const result = await service.mineProject(
				project,
				userInfo,
				taskId,
				{ reflect: false, content: '' },
				'deepseek' as any
			);

			expect(projectMinedModel.deleteOne).toHaveBeenCalledWith({ _id: 'existing123' });
			expect(result).toBeInstanceOf(Observable);
		});

		it('应该成功执行项目挖掘任务', async () => {
			projectMinedModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null)
			});
			projectModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue({ _id: 'project123' })
			});

			const result = await service.mineProject(
				project,
				userInfo,
				taskId,
				{ reflect: false, content: '' },
				'deepseek' as any
			);

			expect(result).toBeInstanceOf(Observable);
			expect(projectChainService.mineChain).toHaveBeenCalledWith(
				true,
				'deepseek',
				userInfo,
				skillService
			);
		});
	});

	describe('_resultHandlerCreater', () => {
		it('应该创建正确的结果处理器', async () => {
			const userInfo = { userId: 'user123', username: 'test' };
			const existingProject = { _id: 'project123' };

			const resultHandler = await service['_resultHandlerCreater'](
				{} as any, // schema
				projectMinedModel,
				userInfo,
				'mining' as any,
				'mined' as any,
				{} as any, // inputSchema
				existingProject as any
			);

			expect(typeof resultHandler).toBe('function');
		});
	});
});
