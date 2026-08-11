import { isPdfInterviewQuestionTitle } from './pdf-question-bank-parser';
import { hasValidPdfMindmap, normalizePdfMindmap } from './pdf-question-bank-mindmap';

export interface PdfQuestionBankResult {
	question: string;
	answer: string;
	projectPoints: string;
	mindmap: string;
	technologyStack: string;
	technologyPoint: string;
	frequency: '高频' | '中频' | '低频';
	hasConcreteProjectMatch: boolean;
	projectEvidence: string[];
}

export function validatePdfQuestionBankResult(result: PdfQuestionBankResult, originalQuestion: string, projectContext: string) {
	const normalized = { ...result, mindmap: normalizePdfMindmap(result.mindmap, originalQuestion) };
	const violations: string[] = [];
	if (!isPdfInterviewQuestionTitle(normalized.question)) violations.push('题目不是有效面试问题');
	if (normalized.answer.trim().length < 20) violations.push('答案过短');
	if (!hasValidPdfMindmap(normalized.mindmap)) violations.push('思维导图不是有效 Markdown 标题结构');
	if (!projectContext.trim() && (normalized.hasConcreteProjectMatch || normalized.projectEvidence.length || normalized.projectPoints.trim() !== '无')) {
		violations.push('没有项目代码证据时不能生成项目要点');
	}
	if (normalized.hasConcreteProjectMatch && !normalized.projectEvidence.some(item => projectContext.includes(item))) {
		violations.push('项目证据不在检索上下文中');
	}
	return { valid: violations.length === 0, violations, result: normalized };
}
