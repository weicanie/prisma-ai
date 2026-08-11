import { normalizePdfTechnologyPoint, normalizePdfTechnologyStack } from './pdf-question-bank-classification';

describe('PDF question bank classification', () => {
	it('normalizes model labels to a stable technology stack and point', () => {
		const stack = normalizePdfTechnologyStack('数据库索引与事务', 'MySQL 索引为什么需要回表？');
		expect(stack).toBe('MySQL');
		expect(normalizePdfTechnologyPoint('MySQL 索引回表', stack)).toBe('索引回表');
	});
});
