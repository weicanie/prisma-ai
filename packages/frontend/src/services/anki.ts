import type {
	PersistentTaskVo,
	ServerDataFormat as SDF,
	StartCrawlQuestionDto
} from '@prisma-ai/shared';
import { instance } from './config';

export async function startCrawlQuestions(crawlData: StartCrawlQuestionDto) {
	const res = await instance.post<StartCrawlQuestionDto, SDF<{ id: string }>>(
		'/question/crawl',
		crawlData
	);
	return res.data;
}

export async function startGenerateMindmap() {
	const res = await instance.post<null, SDF<{ id: string }>>('/question/generate-mindmap', null);
	return res.data;
}

export async function startUploadToAnki() {
	const res = await instance.post<null, SDF<{ id: string }>>('/question/upload-to-anki', null);
	return res.data;
}

export async function startPdfQuestionBankImport(files: File[], projectKnowledgeId?: string) {
	const formData = new FormData();
	files.forEach(file => formData.append('files', file));
	if (projectKnowledgeId) formData.append('projectKnowledgeId', projectKnowledgeId);
	const res = await instance.post<FormData, SDF<{ id: string }>>(
		'/question/import-pdf-question-bank-to-anki',
		formData,
		{ headers: { 'Content-Type': 'multipart/form-data' } }
	);
	return res.data;
}

export async function retryPdfQuestionBankImport(taskId: string) {
	const res = await instance.post<null, SDF<{ id: string }>>(
		`/question/import-pdf-question-bank-to-anki/retry/${taskId}`,
		null
	);
	return res.data;
}

export async function abortTask(taskId: string) {
	const res = await instance.post<null, SDF<{ id: string; aborted: boolean }>>(`/question/task/${taskId}/abort`, null);
	return res.data;
}

export async function getTaskResult(taskId: string) {
	const res = await instance.get<SDF<{ task: PersistentTaskVo }>>(`/question/task/${taskId}`);
	return res.data;
}
