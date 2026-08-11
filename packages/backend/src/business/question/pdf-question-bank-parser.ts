export interface PdfQuestionCandidate {
	title: string;
	sourceText: string;
	sourceFile: string;
}

export interface PdfQuestionParseResult {
	questions: PdfQuestionCandidate[];
	stats: { lineCount: number; candidateCount: number; rejectedCount: number };
}

const QUESTION_CUES = ['什么', '为什么', '如何', '怎么', '怎样', '介绍', '说一下', '讲一下', '谈谈', '是否'];
const ANSWER_PREFIXES = ['然后', '因此', '所以', '例如', '具体来说', '接下来', '可以看到', '在', '此时', '主要包括'];
const STRUCTURAL_ENDING = /(原理|机制|流程|过程|区别|特点|优缺点|场景|原则|隔离级别|底层实现)$/;
const NUMBER_PREFIX = /^\s*(?:[（(]?\d{1,4}[）).、:：]|\d{1,4}\s+)\s*/;

function clean(value: string) {
	return value.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
}

function withoutNumber(value: string) {
	return value.replace(NUMBER_PREFIX, '').trim();
}

function isNoise(value: string) {
	return !value || /^\d{1,4}$/.test(value) || /^(page|第\s*\d+\s*页)$/i.test(value) || /^(https?:\/\/|www\.)/i.test(value);
}

function isAnswerLike(value: string) {
	if (ANSWER_PREFIXES.some(prefix => value.startsWith(prefix))) return true;
	if (/^(?:[A-Za-z]:)?[\\/]|^\/(?:[A-Za-z]|var|etc)\b/.test(value)) return true;
	if (/\.(?:java|xml|yml|yaml|json|sql|sh|properties)\b/i.test(value)) return true;
	if (value.length > 70 && /[。；;]/.test(value)) return true;
	return value.includes('：') || value.includes(':');
}

export function isPdfInterviewQuestionTitle(input: string) {
	const title = withoutNumber(clean(input));
	if (title.length < 5 || title.length > 180 || isAnswerLike(title)) return false;
	return /[？?]$/.test(title) || QUESTION_CUES.some(cue => title.includes(cue)) || STRUCTURAL_ENDING.test(title);
}

export function normalizePdfQuestionTitle(input: string) {
	return withoutNumber(clean(input)).replace(/[？?。；;！!]/g, '').replace(/\s+/g, '').toLowerCase();
}

export function splitPdfQuestions(text: string, sourceFile: string): PdfQuestionParseResult {
	const lines = text.replace(/\r\n?/g, '\n').replace(/\f/g, '\n').split('\n').map(clean);
	const questions: PdfQuestionCandidate[] = [];
	let current: PdfQuestionCandidate | null = null;
	let candidateCount = 0;

	const flush = () => {
		if (current && current.sourceText.trim().length >= 20) questions.push(current);
		current = null;
	};

	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		if (isNoise(line)) continue;
		const next = lines[index + 1] ?? '';
		const merged = `${line} ${next}`.trim();
		let title = '';
		let consumedNext = false;

		if (isPdfInterviewQuestionTitle(line)) {
			title = withoutNumber(line);
		} else if (line.length <= 80 && isPdfInterviewQuestionTitle(merged)) {
			title = withoutNumber(merged);
			consumedNext = true;
		}

		if (title) {
			flush();
			candidateCount++;
			current = { title, sourceText: '', sourceFile };
			if (consumedNext) index++;
			continue;
		}
		if (current) current.sourceText += `${line}\n`;
	}
	flush();

	const unique = new Map<string, PdfQuestionCandidate>();
	for (const question of questions) unique.set(normalizePdfQuestionTitle(question.title), question);
	return {
		questions: [...unique.values()],
		stats: { lineCount: lines.length, candidateCount, rejectedCount: candidateCount - questions.length }
	};
}
