import * as crypto from 'crypto';
import { normalizePdfQuestionTitle } from './pdf-question-bank-parser';

export function pdfQuestionImportKey(title: string): string {
	return crypto.createHash('sha256').update(normalizePdfQuestionTitle(title)).digest('hex');
}

export function pdfQuestionImportLink(userId: number, title: string): string {
	return `pdf-question-import://${userId}/${pdfQuestionImportKey(title)}`;
}
