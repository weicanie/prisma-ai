import { hasValidPdfMindmap, normalizePdfMindmap } from './pdf-question-bank-mindmap';

describe('PDF question bank mindmap', () => {
	it('normalizes fenced and list-prefixed headings', () => {
		const result = normalizePdfMindmap('```markdown\n- ### 索引原理\n- #### B+ 树\n```', 'MySQL 索引是什么？');
		expect(result).toMatch(/^# 索引原理/m);
		expect(hasValidPdfMindmap(result)).toBe(true);
	});

	it('builds a safe root when the model returns plain text', () => {
		const result = normalizePdfMindmap('索引加速查询\nB+ 树适合范围查询', 'MySQL 索引是什么？');
		expect(result).toMatch(/^# MySQL 索引是什么？/m);
		expect(result).toContain('## 核心要点');
	});
});
