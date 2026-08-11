import { NotFoundException } from '@nestjs/common';
import { ProjectKnowledgeTypeEnum } from '@prisma-ai/shared';

jest.mock('../prisma-agent/data_base/konwledge_vdb.service', () => ({ KnowledgeVDBService: class {} }));
jest.mock('../prisma-agent/data_base/project_code_vdb.service', () => ({ ProjectCodeVDBService: class {} }));

import { KnowledgebaseService } from './knowledge-base.service';

describe('KnowledgebaseService project repository resolution', () => {
	it('returns the repository name only for an owned code knowledge entry', async () => {
		const service = new KnowledgebaseService({} as any, {} as any, {} as any, {} as any);
		const exec = jest.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011', content: 'https://github.com/example/checkout.git', type: ProjectKnowledgeTypeEnum.userProjectCode });
		const findOne = jest.fn().mockReturnValue({ exec });
		(service as any).knowledgebaseModel = { findOne };

		await expect(service.resolveUserProjectCode('507f1f77bcf86cd799439011', { userId: 7 } as any)).resolves.toEqual({
			id: '507f1f77bcf86cd799439011',
			repositoryName: 'checkout',
			repositoryUrl: 'https://github.com/example/checkout.git'
		});
		expect(findOne).toHaveBeenCalledWith(expect.objectContaining({ 'userInfo.userId': 7, type: ProjectKnowledgeTypeEnum.userProjectCode }));
	});

	it('rejects a repository knowledge entry owned by another user', async () => {
		const service = new KnowledgebaseService({} as any, {} as any, {} as any, {} as any);
		(service as any).knowledgebaseModel = { findOne: () => ({ exec: () => Promise.resolve(null) }) };

		await expect(service.resolveUserProjectCode('507f1f77bcf86cd799439011', { userId: 7 } as any)).rejects.toBeInstanceOf(NotFoundException);
	});
});
