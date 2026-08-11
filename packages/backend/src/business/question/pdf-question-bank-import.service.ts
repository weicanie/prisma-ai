import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserConfig, UserInfoFromToken } from '@prisma-ai/shared';
import { execFile } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import pdf from 'pdf-parse';
import { promisify } from 'util';
import { z } from 'zod';
import { ChainService } from '../../chain/chain.service';
import { DbService } from '../../DB/db.service';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { PersistentTask, TaskStatus } from '../../type/taskqueue';
import { RubustStructuredOutputParser } from '../../utils/RubustStructuredOutputParser';
import { KnowledgebaseService } from '../knowledge-base/knowledge-base.service';
import { ProjectCodeVDBService } from '../prisma-agent/data_base/project_code_vdb.service';
import { AnkiUploadService } from './anki-upload.service';
import { normalizePdfTechnologyPoint, normalizePdfTechnologyStack } from './pdf-question-bank-classification';
import { pdfQuestionImportKey, pdfQuestionImportLink } from './pdf-question-bank-identity';
import { splitPdfQuestions, PdfQuestionCandidate } from './pdf-question-bank-parser';
import { PdfQuestionBankResult, validatePdfQuestionBankResult } from './pdf-question-bank-quality';

const resultSchema = z.object({
	question: z.string().min(1),
	answer: z.string().min(1),
	projectPoints: z.string().default('无'),
	mindmap: z.string().min(1),
	technologyStack: z.string().min(1),
	technologyPoint: z.string().min(1),
	frequency: z.enum(['高频', '中频', '低频']),
	hasConcreteProjectMatch: z.boolean().default(false),
	projectEvidence: z.array(z.string()).default([])
});

interface PdfQuestionBankTask extends PersistentTask {
	metadata: {
		options: {
			userId: number;
			userInfo: UserInfoFromToken;
			root: string;
			projectKnowledgeId?: string;
			projectRepository?: string;
			onlyKeys?: string[];
		};
		progress: {
			totalCount: number;
			completedCount: number;
			failedCount: number;
			reviewCount: number;
			stage: string;
			currentQuestion?: string;
			failedKeys?: string[];
			reviewKeys?: string[];
		};
	};
}

@Injectable()
export class PdfQuestionBankImportService implements OnModuleInit {
	private readonly logger = new Logger(PdfQuestionBankImportService.name);
	private readonly taskType = 'import-pdf-question-bank-to-anki';
	private readonly pipelineVersion = 'pdf-question-bank-v1';
	private readonly concurrency = Math.max(1, Number(process.env.PDF_QUESTION_BANK_IMPORT_CONCURRENCY ?? 2));
	private readonly execFileAsync = promisify(execFile);

	constructor(
		private readonly db: DbService,
		private readonly chainService: ChainService,
		private readonly taskQueueService: TaskQueueService,
		private readonly ankiUploadService: AnkiUploadService,
		private readonly knowledgebaseService: KnowledgebaseService,
		private readonly projectCodeVDBService: ProjectCodeVDBService
	) {}

	onModuleInit() {
		this.taskQueueService.registerTaskHandler(this.taskType, this.handleTask.bind(this));
	}

	async start(
		userInfo: UserInfoFromToken,
		sessionId: string,
		root: string,
		projectKnowledgeId?: string,
		onlyKeys?: string[]
	) {
		let projectRepository: string | undefined;
		if (projectKnowledgeId) {
			projectRepository = (await this.knowledgebaseService.resolveUserProjectCode(projectKnowledgeId, userInfo)).repositoryName;
		}
		return this.taskQueueService.createAndEnqueueTask(sessionId, userInfo.userId, this.taskType, {
			options: { userId: Number(userInfo.userId), userInfo, root, projectKnowledgeId, projectRepository, onlyKeys },
			progress: { totalCount: -1, completedCount: 0, failedCount: 0, reviewCount: 0, stage: 'parsing', failedKeys: [], reviewKeys: [] }
		});
	}

	async retry(task: PdfQuestionBankTask, userInfo: UserInfoFromToken) {
		const onlyKeys = [...new Set([...(task.metadata.progress.failedKeys ?? []), ...(task.metadata.progress.reviewKeys ?? [])])];
		return this.start(
			userInfo,
			crypto.randomUUID(),
			task.metadata.options.root,
			task.metadata.options.projectKnowledgeId,
			onlyKeys.length ? onlyKeys : undefined
		);
	}

	private async handleTask(task: PdfQuestionBankTask) {
		const { userId, userInfo, root, projectRepository } = task.metadata.options;
		const allQuestions = await this.readQuestions(root);
		const onlyKeys = new Set(task.metadata.options.onlyKeys ?? []);
		const questions = onlyKeys.size ? allQuestions.filter(question => onlyKeys.has(this.questionKey(question))) : allQuestions;
		await this.updateProgress(task, { totalCount: questions.length, completedCount: 0, failedCount: 0, reviewCount: 0, stage: 'generating', failedKeys: [], reviewKeys: [] });

		let completedCount = 0;
		let failedCount = 0;
		let reviewCount = 0;
		const failedKeys: string[] = [];
		const reviewKeys: string[] = [];
		for (let offset = 0; offset < questions.length; offset += this.concurrency) {
			if (!(await this.isRunning(task.id))) return;
			const results = await Promise.all(questions.slice(offset, offset + this.concurrency).map(question => this.processQuestion(task, question, userId, userInfo, projectRepository)));
			for (const result of results) {
				if (result.cancelled) return;
				if (result.success) {
					completedCount++;
					if (result.review) { reviewCount++; reviewKeys.push(result.key); }
				} else { failedCount++; failedKeys.push(result.key); }
				await this.updateProgress(task, { totalCount: questions.length, completedCount, failedCount, reviewCount, stage: result.review ? 'pending-review' : 'generating', currentQuestion: result.title, failedKeys, reviewKeys });
			}
		}
		this.logger.log(`PDF question bank import completed: ${completedCount} success, ${failedCount} failed, ${reviewCount} pending review.`);
	}

	private async processQuestion(task: PdfQuestionBankTask, question: PdfQuestionCandidate, userId: number, userInfo: UserInfoFromToken, projectRepository?: string) {
		const key = this.questionKey(question);
		if (!(await this.isRunning(task.id))) return { title: question.title, key, success: false, cancelled: true, review: false };
		try {
			const projectContext = await this.retrieveProjectContext(question, userInfo, projectRepository);
			const outcome = await this.upsertQuestion(question, userId, userInfo.userConfig, projectRepository, projectContext);
			if (!(await this.isRunning(task.id))) return { title: question.title, key, success: false, cancelled: true, review: false };
			if (!outcome.review) await this.ankiUploadService.uploadPdfQuestionToAnki(outcome.articleId);
			return { title: question.title, key, success: true, review: outcome.review };
		} catch (error) {
			this.logger.error(`PDF question import failed: ${question.title}`, error instanceof Error ? error.stack : String(error));
			return { title: question.title, key, success: false, cancelled: false, review: false };
		}
	}

	private async retrieveProjectContext(question: PdfQuestionCandidate, userInfo: UserInfoFromToken, projectRepository?: string) {
		if (!projectRepository || !userInfo.userConfig.vectorDb.pinecone.apiKey) return '';
		try {
			return await this.projectCodeVDBService.retrieveCodeChunksWithScoreFilter(`${question.title}\n${question.sourceText.slice(0, 1200)}`, 8, userInfo, projectRepository, 0.6);
		} catch (error) {
			this.logger.warn(`Project context retrieval skipped for ${question.title}: ${error instanceof Error ? error.message : String(error)}`);
			return '';
		}
	}

	private async upsertQuestion(question: PdfQuestionCandidate, userId: number, userConfig: UserConfig, projectRepository: string | undefined, projectContext: string) {
		const inputHash = crypto.createHash('sha256').update([this.pipelineVersion, question.title, question.sourceText, projectRepository ?? '', projectContext].join('\n')).digest('hex');
		const link = pdfQuestionImportLink(userId, question.title);
		const cached = await this.db.pdf_question_import_meta.findUnique({ where: { user_id_input_hash: { user_id: userId, input_hash: inputHash } } });
		if (cached?.status === 'UPLOADED') return { articleId: cached.article_id, review: false };

		const generated = await this.generateWithQuality(question, projectContext, userConfig);
		const result = generated.result;
		const hasProject = Boolean(projectContext.trim()) && result.hasConcreteProjectMatch && result.projectEvidence.some(item => projectContext.includes(item));
		const stack = normalizePdfTechnologyStack(result.technologyStack, question.title);
		const point = normalizePdfTechnologyPoint(result.technologyPoint, stack);
		const title = hasProject && /[？?]|什么|为什么|如何|怎么|介绍|说/.test(result.question) ? result.question.trim() : question.title;
		const existing = await this.db.article.findUnique({ where: { link } });
		const articleData = {
			title,
			quiz_type: '问答题',
			content: result.answer.trim(),
			gist: hasProject ? result.projectPoints.trim() : '无',
			content_mindmap: result.mindmap,
			content_type: point,
			job_type: stack,
			hard: hasProject ? '高频' : result.frequency
		};
		const article = existing ? await this.db.article.update({ where: { id: existing.id }, data: articleData }) : await this.db.article.create({ data: { link, ...articleData } });
		await this.db.user_article.upsert({ where: { user_id_article_id: { user_id: userId, article_id: article.id } }, create: { user_id: userId, article_id: article.id }, update: {} });
		await this.db.pdf_question_import_meta.upsert({
			where: { article_id: article.id },
			create: { article_id: article.id, user_id: userId, input_hash: inputHash, pipeline_version: this.pipelineVersion, project_repository: projectRepository, status: generated.valid ? 'READY' : 'PENDING_REVIEW', failure_reason: generated.violations.join(' | ') || null, attempt_count: generated.attempts },
			update: { user_id: userId, input_hash: inputHash, pipeline_version: this.pipelineVersion, project_repository: projectRepository, status: generated.valid ? 'READY' : 'PENDING_REVIEW', failure_reason: generated.violations.join(' | ') || null, attempt_count: generated.attempts }
		});
		return { articleId: article.id, review: !generated.valid };
	}

	private async generateWithQuality(question: PdfQuestionCandidate, projectContext: string, userConfig: UserConfig) {
		let result = await this.generate(question, projectContext, userConfig);
		for (let attempt = 1; attempt <= 3; attempt++) {
			if (!projectContext.trim()) { result.hasConcreteProjectMatch = false; result.projectPoints = '无'; result.projectEvidence = []; }
			const report = validatePdfQuestionBankResult(result, question.title, projectContext);
			if (report.valid || attempt === 3) return { ...report, attempts: attempt };
			result = await this.generate(question, projectContext, userConfig, report.violations.join('\n'));
		}
		throw new Error('PDF question quality loop ended unexpectedly');
	}

	private async generate(question: PdfQuestionCandidate, projectContext: string, userConfig: UserConfig, repairFeedback = ''): Promise<PdfQuestionBankResult> {
		const parser = RubustStructuredOutputParser.from(resultSchema, this.chainService, userConfig);
		const prompt = ChatPromptTemplate.fromMessages([
			['system', '你是技术面试题库编辑。只基于原始题目和正文生成可背诵的准确答案。question 必须是面试问题，不能把答案、目录、路径、命令或说明文字改写成问题。没有明确项目代码证据时 projectPoints 必须为“无”、hasConcreteProjectMatch 为 false、projectEvidence 为空。technologyStack 是一级技术栈，technologyPoint 是简短知识点。mindmap 必须以 # 开头，且至少含一个 ## 子标题。题目、答案、思维导图必须围绕同一知识点。\n{format_instructions}'],
			['human', '原始题目：{question}\n原始正文：{sourceText}\n项目代码上下文：{projectContext}\n质量修复要求：{repairFeedback}']
		]);
		const model = await this.chainService.getStructuredLLM(userConfig.agent.model.plan_step, userConfig);
		const chain = RunnableSequence.from([{ question: () => question.title, sourceText: () => question.sourceText, projectContext: () => projectContext || '无', repairFeedback: () => repairFeedback || '无', format_instructions: () => parser.getFormatInstructions() }, prompt, model, parser]);
		return await chain.invoke({}) as PdfQuestionBankResult;
	}

	private async readQuestions(root: string) {
		const files = await this.findPdfFiles(root);
		if (!files.length) throw new Error('没有可导入的 PDF 文件');
		const questions: PdfQuestionCandidate[] = [];
		for (const file of files) {
			let text = '';
			try { text = (await pdf(await fs.readFile(file))).text.trim(); } catch (error) { this.logger.warn(`PDF text parsing failed: ${path.basename(file)}`); }
			if (!text) text = await this.ocrPdf(file);
			const parsed = splitPdfQuestions(text, path.relative(root, file));
			this.logger.log(`[PDF parse] ${path.basename(file)}: ${parsed.questions.length} accepted questions.`);
			questions.push(...parsed.questions);
		}
		const unique = new Map<string, PdfQuestionCandidate>();
		for (const question of questions) unique.set(this.questionKey(question), question);
		return [...unique.values()];
	}

	private async findPdfFiles(root: string): Promise<string[]> {
		const entries = await fs.readdir(root, { withFileTypes: true });
		const children = await Promise.all(entries.map(async entry => entry.isDirectory() ? this.findPdfFiles(path.join(root, entry.name)) : entry.name.toLowerCase().endsWith('.pdf') ? [path.join(root, entry.name)] : []));
		return children.flat();
	}

	private async ocrPdf(file: string) {
		const directory = await fs.mkdtemp(path.join(process.env.TEMP ?? '/tmp', 'pdf-question-bank-'));
		try {
			const prefix = path.join(directory, 'page');
			await this.execFileAsync('pdftoppm', ['-png', '-r', '150', file, prefix]);
			const pages = (await fs.readdir(directory)).filter(name => name.endsWith('.png')).sort();
			const text = await Promise.all(pages.map(async page => (await this.execFileAsync('tesseract', [path.join(directory, page), 'stdout', '-l', 'chi_sim+eng'])).stdout));
			return text.join('\n');
		} catch (error) {
			this.logger.warn(`PDF OCR failed for ${path.basename(file)}: ${error instanceof Error ? error.message : String(error)}`);
			return '';
		} finally { await fs.rm(directory, { recursive: true, force: true }); }
	}

	private questionKey(question: PdfQuestionCandidate) { return pdfQuestionImportKey(question.title); }
	private async isRunning(taskId: string) { return (await this.taskQueueService.getTask(taskId))?.status === TaskStatus.RUNNING; }
	private async updateProgress(task: PdfQuestionBankTask, progress: PdfQuestionBankTask['metadata']['progress']) {
		const current = await this.taskQueueService.getTask<PdfQuestionBankTask>(task.id);
		if (!current) return;
		current.metadata.progress = progress;
		await this.taskQueueService.saveTask(current);
	}
}
