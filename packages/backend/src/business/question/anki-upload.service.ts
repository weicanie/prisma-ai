import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import * as http from 'http';
import { chunk } from 'lodash';
import { firstValueFrom } from 'rxjs';
import { article } from '../../../generated/client';
import { DbService } from '../../DB/db.service';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { PersistentTask } from '../../type/taskqueue';

interface AnkiUploadTask extends PersistentTask {
	metadata: {
		options: {
			userId: number;
		};
		progress: {
			totalCount: number;
			completedCount: number;
		};
	};
}
interface AnkiNote {
	deckName: string;
	modelName: string;
	fields: {
		[key: string]: string;
	};
	tags: string[];
}

interface AnkiAddNotesParams {
	notes: AnkiNote[];
}
/**
 * 重复笔记错误信息
 */
const DUMPLICATE_ERROR_MESSAGE = 'cannot create note because it is a duplicate';
@Injectable()
export class AnkiUploadService implements OnModuleInit {
	private readonly logger = new Logger(AnkiUploadService.name);
	private readonly ANKI_CONNECT_URL = 'http://localhost:8765';
	private readonly ANKI_MODEL_NAME = '面试题2.0';
	private readonly PDF_QUESTION_BANK_MODEL_NAME = 'PDF 智能题库';
	private readonly PAGE_SIZE = 500; // 每次从数据库查询的数量
	private readonly ANKI_API_BATCH_SIZE = 20; // 每次调用Anki-Connect API的笔记数量
	private readonly ankiHttpAgent: http.Agent; // 用于Anki-Connect请求的自定义HttpAgent
	private pdfQuestionBankModelReady: Promise<void> | null = null;

	constructor(
		private readonly db: DbService,
		private readonly taskQueueService: TaskQueueService,
		private readonly httpService: HttpService
	) {
		// 初始化一个禁用了Keep-Alive的HttpAgent
		// 这可以防止因连接重用而导致的ECONNRESET错误
		this.ankiHttpAgent = new http.Agent({ keepAlive: false });
	}

	/**
	 * @description 模块初始化时，向任务队列服务注册Anki上传任务的处理器
	 */
	onModuleInit() {
		this.taskQueueService.registerTaskHandler(
			'upload-questions-to-anki',
			this.handleAnkiUpload.bind(this)
		);
	}

	/**
	 * @description 将“上传题目到Anki”的任务添加到队列中
	 * @param userId 用户ID
	 * @param sessionId 会话ID，用于追踪任务
	 */
	async addAnkiUploadTask(userId: number, sessionId: string) {
		this.logger.log(`为用户 ${userId} 添加上传Anki任务`);
		const task = await this.taskQueueService.createAndEnqueueTask(
			sessionId,
			userId.toString(),
			'upload-questions-to-anki',
			{
				options: { userId },
				progress: { totalCount: -1, completedCount: 0 }
			}
		);
		return task;
	}

	/** Upload or update one PDF question-bank note without involving normal question deduplication. */
	async uploadPdfQuestionToAnki(articleId: number): Promise<void> {
		const qdata = await this.db.article.findUnique({ where: { id: articleId } });
		if (!qdata || !qdata.link.startsWith('pdf-question-import://')) return;
		await this.ensurePdfQuestionBankModel();
		const note = this.buildPdfQuestionBankNote(qdata);
		await this.createDeck(note.deckName);

		if (qdata.anki_note_id) {
			try {
				await this.requestAnkiConnect('updateNoteFields', { note: { id: Number(qdata.anki_note_id), fields: note.fields } });
				await this.db.article.update({ where: { id: articleId }, data: { content_mindmap: note.fields.思维导图 } });
				return;
			} catch (error) {
				if (!(error instanceof Error) || !error.message.includes('Note was not found')) throw error;
				this.logger.warn(`PDF question ${articleId} no longer exists in Anki, creating it again.`);
			}
		}

		const check = await this.canAddNotes([note]);
		if (!check[0]?.canAdd) {
			if (check[0]?.error === DUMPLICATE_ERROR_MESSAGE) {
				const noteId = await this.findPdfQuestionNote(qdata.link);
				if (noteId) {
					await this.db.article.update({ where: { id: articleId }, data: { anki_note_id: noteId, content_mindmap: note.fields.思维导图 } });
					await this.db.pdf_question_import_meta.updateMany({ where: { article_id: articleId }, data: { status: 'UPLOADED' } });
					return;
				}
				throw new Error(`Anki duplicate detected but stable PDF import key was not found: ${qdata.link}`);
			}
			throw new Error(check[0]?.error ?? 'Anki rejected the PDF question');
		}
		const [noteId] = await this.addNotes([note]);
		if (!noteId) throw new Error('Anki did not return a note id for the PDF question');
		await this.db.article.update({ where: { id: articleId }, data: { anki_note_id: noteId, content_mindmap: note.fields.思维导图 } });
		await this.db.pdf_question_import_meta.updateMany({ where: { article_id: articleId }, data: { status: 'UPLOADED' } });
	}

	private async findPdfQuestionNote(importKey: string): Promise<number | null> {
		const modelQuery = `model:"${this.PDF_QUESTION_BANK_MODEL_NAME.replace(/([\\"])/g, '\\$1')}"`;
		const noteIds = await this.requestAnkiConnect('findNotes', { query: modelQuery });
		if (!Array.isArray(noteIds) || !noteIds.length) return null;
		const notes = await this.requestAnkiConnect('notesInfo', { notes: noteIds });
		if (!Array.isArray(notes)) return null;
		const matched = notes.find(note => note?.fields?.导入键?.value === importKey);
		return matched?.noteId ? Number(matched.noteId) : null;
	}

	/**
	 * @description 执行上传Anki任务的处理器
	 * @param task 任务对象
	 */
	private async handleAnkiUpload(task: AnkiUploadTask) {
		const { userId } = task.metadata.options;
		this.logger.log(`开始处理任务 ${task.id}，为用户 ${userId} 上传题目到Anki...`);

		try {
			// 统计用户未上传到anki的题目数量（多对多改造）
			const totalCount = await this.db.user_article.count({
				where: {
					user_id: userId,
					article: {
						anki_note_id: null
					}
				}
			});

			await this._updateTaskProgress(task, { totalCount, completedCount: 0 });

			if (totalCount === 0) {
				this.logger.log(`用户 ${userId} 没有未上传的题目了。`);
				return;
			}
			let completedCount = 0;
			let hasMore = true;

			while (hasMore) {
				const userArticles = await this.db.user_article.findMany({
					where: {
						user_id: userId,
						article: {
							anki_note_id: null
						}
					},
					include: { article: true },
					take: this.PAGE_SIZE
					//分页是错的,因为未上传题目每轮都减少,直接读取即可
					// skip: page * this.PAGE_SIZE
				});

				if (userArticles.length === 0) {
					hasMore = false;
					this.logger.log(`用户 ${userId} 没有更多未上传的题目了。`);
					continue;
				}

				this.logger.log(
					`任务 ${task.id}: 从数据库获取了 ${userArticles.length} 条题目，准备分批上传...`
				);

				// 将从数据库获取的大批次数据，切分为适合API调用的小批次
				const articleChunks = chunk(userArticles, this.ANKI_API_BATCH_SIZE);

				for (const [index, userArticleChunk] of articleChunks.entries()) {
					try {
						this.logger.log(
							`任务 ${task.id}: 正在处理微批次 ${index + 1}/${articleChunks.length}，包含 ${userArticleChunk.length} 条笔记...`
						);

						const deckNames = new Set<string>();
						userArticleChunk.forEach(ua => {
							const deckName = ua.article.job_type ?? '未知';
							deckNames.add(deckName);
						});
						// 创建各个题目类别的卡组（::是归类，只有叶节点是真正的卡组）
						for (const deck of deckNames) {
							await this.createDeck(deck);
						}

						const notesToCheck = userArticleChunk.map((ua, i) => ({
							articleId: ua.article.id,
							note: this.buildAnkiNote(ua.article)
						}));

						const checkResults = await this.canAddNotes(notesToCheck.map(n => n.note));

						const notesToAdd: { articleId: number; note: AnkiNote }[] = [];
						const duplicateUpdatePromises: any[] = [];

						checkResults.forEach((result, i) => {
							if (result.canAdd) {
								notesToAdd.push(notesToCheck[i]);
							} else if (result.error === DUMPLICATE_ERROR_MESSAGE) {
								const originalArticle = userArticleChunk[i].article;
								this.logger.warn(
									`任务 ${task.id}: 笔记 "${originalArticle.title}" (id: ${originalArticle.id}) 是重复的。将唯一化标题以便下次重试。`
								);
								duplicateUpdatePromises.push(
									this.db.article.update({
										where: { id: originalArticle.id },
										data: { title: `${originalArticle.title} 【${originalArticle.id}】` }
									})
								);
							} else {
								const originalArticle = userArticleChunk[i].article;
								this.logger.error(
									`任务 ${task.id}: 添加笔记 "${originalArticle.title}" (id: ${originalArticle.id}) 时遇到非重复性错误: ${result.error}`
								);
							}
						});

						if (duplicateUpdatePromises.length > 0) {
							await this.db.$transaction(duplicateUpdatePromises);
							this.logger.log(
								`任务 ${task.id}: 为 ${duplicateUpdatePromises.length} 个重复笔记更新了标题。`
							);
						}

						if (notesToAdd.length === 0) {
							this.logger.log(`任务 ${task.id}: 微批次 ${index + 1} 没有可以新添加的笔记。`);
							continue;
						}

						const addedNoteIds = await this.addNotes(notesToAdd.map(n => n.note));

						if (addedNoteIds && addedNoteIds.length === notesToAdd.length) {
							const updatePromises = notesToAdd.map((noteInfo, i) =>
								this.db.article.update({
									where: { id: noteInfo.articleId },
									data: {
										anki_note_id: addedNoteIds[i],
										content_mindmap: noteInfo.note.fields.思维导图
									}
								})
							);
							await this.db.$transaction(updatePromises);
							completedCount += notesToAdd.length;
							await this._updateTaskProgress(task, { totalCount, completedCount });
							this.logger.log(
								`任务 ${task.id}: 微批次 ${index + 1} 成功上传 ${notesToAdd.length} 条笔记到Anki。已完成(${completedCount}/${totalCount})`
							);
						} else {
							this.logger.error(
								`任务 ${task.id}: 微批次 ${index + 1} Anki返回的笔记ID数量与请求不匹配，跳过数据库更新。`
							);
						}
					} catch (e) {
						this.logger.error(`任务 ${task.id}: 微批次 ${index + 1} 处理失败: ${e.message}`);
					}
				}
			}
			this.logger.log(`用户 ${userId} 的Anki上传任务 ${task.id} 已全部完成。`);
		} catch (error) {
			this.logger.error(
				`处理Anki上传任务 ${task.id} 时发生错误: ${error instanceof Error ? error.message : String(error)}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * @description 构建单条Anki笔记的数据结构
	 */
	private buildAnkiNote(qdata: article): AnkiNote {
		const deckName = qdata.link.startsWith('https://fe.ecool.fun')
			? `题库::前端::${qdata.content_type}`
			: `题库::Java 后端::${qdata.content_type}`;

		return {
			deckName,
			modelName: this.ANKI_MODEL_NAME,
			fields: {
				笔记: qdata.user_note ?? '暂无',
				标题: qdata.title ?? '无',
				内容: qdata.content ?? '无',
				要点: qdata.gist ?? '无',
				思维导图:
					qdata.content_mindmap
						?.replaceAll('- ###', '###')
						.replaceAll('- ####', '####')
						.replaceAll('- ##', '##') ?? '无',
				标签: qdata.content_type ?? '无',
				难度: String(qdata.hard ?? '无')
			},
			tags: [
				qdata.content_type ?? '无标签',
				qdata.link.startsWith('https://fe.ecool.fun') ? '前端' : '后端'
			]
		};
	}

	private buildPdfQuestionBankNote(qdata: article): AnkiNote {
		const sanitizePart = (value: string) => value.replace(/[\\/:*?"<>|]/g, '_').trim() || '未分类';
		return {
			deckName: `PDF 题库::${sanitizePart(qdata.job_type ?? '未分类')}::${sanitizePart(qdata.hard ?? '未分类')}::${sanitizePart(qdata.content_type ?? '未分类')}`,
			modelName: this.PDF_QUESTION_BANK_MODEL_NAME,
			fields: {
				导入键: qdata.link,
				标题: qdata.title ?? '无',
				内容: qdata.content ?? '无',
				要点: qdata.gist ?? '无',
				思维导图: qdata.content_mindmap ?? '无',
				标签: qdata.content_type ?? '未分类',
				频次: qdata.hard ?? '未分类'
			},
			tags: ['pdf-question-import', qdata.job_type ?? '未分类', qdata.hard ?? '未分类', qdata.content_type ?? '未分类']
		};
	}

	private async ensurePdfQuestionBankModel(): Promise<void> {
		if (this.pdfQuestionBankModelReady) return this.pdfQuestionBankModelReady;
		this.pdfQuestionBankModelReady = (async () => {
			const names = await this.requestAnkiConnect('modelNames', {});
			if (Array.isArray(names) && names.includes(this.PDF_QUESTION_BANK_MODEL_NAME)) return;
			try {
				await this.requestAnkiConnect('createModel', {
					modelName: this.PDF_QUESTION_BANK_MODEL_NAME,
					inOrderFields: ['导入键', '标题', '内容', '要点', '思维导图', '标签', '频次'],
					css: '.import-key { display: none; }\n.card { font-family: Arial, sans-serif; font-size: 20px; text-align: left; }',
					cardTemplates: [{
						Name: 'PDF 题库卡片',
						Front: '<div class="import-key">{{导入键}}</div><h2>{{标题}}</h2>',
						Back: '{{FrontSide}}<hr id="answer"><div>{{内容}}</div><hr><h3>要点</h3><div>{{要点}}</div><hr><h3>思维导图</h3><pre>{{思维导图}}</pre>'
					}]
				});
			} catch (error) {
				const refreshed = await this.requestAnkiConnect('modelNames', {});
				if (!Array.isArray(refreshed) || !refreshed.includes(this.PDF_QUESTION_BANK_MODEL_NAME)) throw error;
			}
		})();
		try { await this.pdfQuestionBankModelReady; } catch (error) { this.pdfQuestionBankModelReady = null; throw error; }
	}

	/**
	 * @description 调用Anki-Connect的 createDeck 接口
	 */
	private async createDeck(deckName: string): Promise<number | null> {
		const response = await this.requestAnkiConnect('createDeck', { deck: deckName });
		this.logger.debug(`创建卡组 ${deckName} 的结果: ${JSON.stringify(response)}`);
		return response as number | null;
	}

	/**
	 * @description 调用Anki-Connect的 canAddNotesWithErrorDetail 接口
	 */
	private async canAddNotes(notes: AnkiNote[]): Promise<{ canAdd: boolean; error?: string }[]> {
		const response = await this.requestAnkiConnect('canAddNotesWithErrorDetail', { notes });
		return response as { canAdd: boolean; error?: string }[];
	}

	/**
	 * @description 调用Anki-Connect的 addNotes 接口
	 */
	private async addNotes(notes: AnkiNote[]): Promise<(number | null)[]> {
		const response = await this.requestAnkiConnect('addNotes', { notes });
		return response as (number | null)[];
	}

	/**
	 * @description 向Anki-Connect API发送请求的通用方法
	 * @param action Anki-Connect的action
	 * @param params action所需的参数
	 */
	private async requestAnkiConnect(
		action: string,
		params: AnkiAddNotesParams | object
	): Promise<any> {
		try {
			// 在请求配置中明确指定使用我们自定义的httpAgent
			const requestConfig: AxiosRequestConfig = {
				httpAgent: this.ankiHttpAgent
			};
			// this.logger.debug('🚀 ~ AnkiUploadService ~ requestAnkiConnect ~ requestConfig:', {
			// 	action,
			// 	version: 6,
			// 	params
			// });
			const { data } = await firstValueFrom(
				this.httpService.post(
					this.ANKI_CONNECT_URL,
					{
						action,
						version: 6,
						params
					},
					requestConfig
				)
			);

			if (data.error) {
				this.logger.error(`requestAnkiConnect Error: ${data.error}`);
				throw new Error(`requestAnkiConnect Error: ${data.error}`);
			}
			return data.result;
		} catch (error) {
			this.logger.error(`requestAnkiConnect Error: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 更新任务进度
	 */
	private async _updateTaskProgress(
		task: AnkiUploadTask,
		progress: { totalCount: number; completedCount: number }
	): Promise<void> {
		const curTask = await this.taskQueueService.getTask<AnkiUploadTask>(task.id);
		if (!curTask) return;

		const newTask: AnkiUploadTask = {
			...curTask,
			metadata: {
				...curTask.metadata,
				progress
			}
		};
		await this.taskQueueService.saveTask(newTask);
	}

	/**
	 * 获取任务进度
	 */
	async getTaskProgress(
		task: AnkiUploadTask
	): Promise<{ totalCount: number; completedCount: number }> {
		const curTask = await this.taskQueueService.getTask<AnkiUploadTask>(task.id);
		if (!curTask || !curTask.metadata.progress) return { totalCount: -1, completedCount: 0 };
		return curTask.metadata.progress;
	}
}
