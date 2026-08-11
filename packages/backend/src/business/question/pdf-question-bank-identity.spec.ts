import { pdfQuestionImportKey, pdfQuestionImportLink } from './pdf-question-bank-identity';

describe('PDF question bank identity', () => {
	it('keeps the same identity across source files and card decks', () => {
		expect(pdfQuestionImportKey('MySQL 索引是什么？')).toBe(pdfQuestionImportKey('  MySQL 索引是什么  '));
		expect(pdfQuestionImportLink(7, 'MySQL 索引是什么？')).toBe(pdfQuestionImportLink(7, 'MySQL 索引是什么'));
	});

	it('isolates users while keeping the question identity stable', () => {
		const title = 'Redis 缓存穿透如何解决？';
		expect(pdfQuestionImportKey(title)).toBe(pdfQuestionImportKey(title));
		expect(pdfQuestionImportLink(7, title)).not.toBe(pdfQuestionImportLink(8, title));
	});
});
