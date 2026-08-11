jest.mock('../knowledge-base/knowledge-base.service', () => ({ KnowledgebaseService: class {} }));
jest.mock('../prisma-agent/data_base/project_code_vdb.service', () => ({ ProjectCodeVDBService: class {} }));

import { PdfQuestionBankImportService } from './pdf-question-bank-import.service';

const question = { title: 'MySQL 索引为什么需要回表？', sourceText: '索引覆盖与回表的区别。', sourceFile: 'mysql.pdf' };
const userInfo = { userConfig: { vectorDb: { pinecone: { apiKey: 'pinecone-key' } } } } as any;

function makeService(projectCodeVDBService: any) {
	return new PdfQuestionBankImportService({} as any, {} as any, {} as any, {} as any, {} as any, projectCodeVDBService);
}

describe('PDF question bank project context', () => {
	it('does not query a project when no repository is selected', async () => {
		const projectCodeVDBService = { retrieveCodeChunksWithScoreFilter: jest.fn() };

		await expect((makeService(projectCodeVDBService) as any).retrieveProjectContext(question, userInfo)).resolves.toBe('');
		expect(projectCodeVDBService.retrieveCodeChunksWithScoreFilter).not.toHaveBeenCalled();
	});

	it('uses only the selected repository namespace on successful retrieval', async () => {
		const projectCodeVDBService = { retrieveCodeChunksWithScoreFilter: jest.fn().mockResolvedValue('src/main/java/IndexService.java\ncovering index') };

		await expect((makeService(projectCodeVDBService) as any).retrieveProjectContext(question, userInfo, 'checkout')).resolves.toContain('IndexService.java');
		expect(projectCodeVDBService.retrieveCodeChunksWithScoreFilter).toHaveBeenCalledWith(expect.stringContaining(question.title), 8, userInfo, 'checkout', 0.6);
	});

	it('falls back to generic questions when vector retrieval fails', async () => {
		const projectCodeVDBService = { retrieveCodeChunksWithScoreFilter: jest.fn().mockRejectedValue(new Error('Pinecone unavailable')) };

		await expect((makeService(projectCodeVDBService) as any).retrieveProjectContext(question, userInfo, 'checkout')).resolves.toBe('');
	});
});
