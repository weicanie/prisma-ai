import { AnkiUploadService } from './anki-upload.service';

function makeArticle(overrides: Record<string, unknown> = {}) {
	return {
		id: 1,
		link: 'pdf-question-import://7/abc123',
		anki_note_id: null,
		title: 'MySQL 索引是什么？',
		content: '索引可以减少扫描的数据范围。',
		gist: '无',
		content_mindmap: '# 索引\n## 原理',
		job_type: 'MySQL',
		hard: '高频',
		content_type: '索引',
		...overrides
	};
}

function makeService(article: any) {
	const db = {
		article: { findUnique: jest.fn().mockResolvedValue(article), update: jest.fn().mockResolvedValue(article) },
		pdf_question_import_meta: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) }
	};
	const service = new AnkiUploadService(db as any, {} as any, {} as any);
	(service as any).ensurePdfQuestionBankModel = jest.fn().mockResolvedValue(undefined);
	(service as any).createDeck = jest.fn().mockResolvedValue(1);
	return { service, db };
}

describe('Anki PDF question upload', () => {
	it('updates an existing note instead of creating a duplicate', async () => {
		const { service, db } = makeService(makeArticle({ anki_note_id: 123 }));
		const request = jest.fn().mockResolvedValue(null);
		(service as any).requestAnkiConnect = request;

		await service.uploadPdfQuestionToAnki(1);

		expect(request).toHaveBeenCalledWith('updateNoteFields', expect.objectContaining({ note: expect.objectContaining({ id: 123 }) }));
		expect(db.article.update).toHaveBeenCalled();
	});

	it('reconnects a duplicate note through the hidden stable import key', async () => {
		const article = makeArticle();
		const { service, db } = makeService(article);
		(service as any).canAddNotes = jest.fn().mockResolvedValue([{ canAdd: false, error: 'cannot create note because it is a duplicate' }]);
		(service as any).requestAnkiConnect = jest.fn().mockImplementation((action: string) => {
			if (action === 'findNotes') return Promise.resolve([456]);
			if (action === 'notesInfo') return Promise.resolve([{ noteId: 456, fields: { 导入键: { value: article.link } } }]);
			return Promise.resolve(null);
		});

		await service.uploadPdfQuestionToAnki(1);

		expect(db.article.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ anki_note_id: 456 }) }));
	});

	it('does not change ordinary crawler notes', async () => {
		const { service } = makeService(makeArticle({ link: 'https://example.com/question/1' }));
		(service as any).ensurePdfQuestionBankModel = jest.fn();

		await service.uploadPdfQuestionToAnki(1);

		expect((service as any).ensurePdfQuestionBankModel).not.toHaveBeenCalled();
	});
});
