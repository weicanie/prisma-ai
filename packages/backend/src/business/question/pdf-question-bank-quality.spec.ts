import { validatePdfQuestionBankResult } from './pdf-question-bank-quality';

const baseResult = {
	question: 'MySQL 索引为什么需要回表？',
	answer: '回表是因为二级索引只保存索引列和主键，查询需要的其他列必须根据主键再次访问聚簇索引。',
	projectPoints: '无',
	mindmap: '# 索引回表\n## 触发条件\n- 二级索引未覆盖查询列',
	technologyStack: 'MySQL',
	technologyPoint: '索引回表',
	frequency: '高频' as const,
	hasConcreteProjectMatch: false,
	projectEvidence: []
};

describe('PDF question bank quality', () => {
	it('accepts a coherent answer and normalized mindmap without project context', () => {
		const report = validatePdfQuestionBankResult(baseResult, baseResult.question, '');
		expect(report.valid).toBe(true);
		expect(report.result.mindmap).toMatch(/^# /);
	});

	it('rejects project points without retrieved evidence', () => {
		const report = validatePdfQuestionBankResult(
			{ ...baseResult, projectPoints: '项目中通过覆盖索引减少回表', hasConcreteProjectMatch: true, projectEvidence: ['IndexService.java'] },
			baseResult.question,
			''
		);
		expect(report.valid).toBe(false);
		expect(report.violations).toContain('没有项目代码证据时不能生成项目要点');
	});
});
