import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PersistentTask } from '@/type/taskqueue';
import { InterviewSummaryCreateDto, UserInfoFromToken } from '@prisma-ai/shared';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import { ChainService } from '../../chain/chain.service';
import { DbService } from '../../DB/db.service';
import { TaskQueueService } from '../../task-queue/task-queue.service';
const QuestionUrl = 'https://pinkprisma/question';

const job_type_list = [
	'前端',
	'后端',
	'全栈',
	'算法',
	'测试',
	'运维',
	'数据分析',
	'实施',
	'安全',
	'其他'
	// '硬件',
	// '游戏开发',
	// '产品',
	// '设计',
	// '运营',
];

/**
 * 预设字段取值常量
 */
const fieldEnum: {
	interview_summary: {
		interview_type: string[];
		job_type: string[];
		company_scale: string[];
	};
	article: {
		quiz_type: string[];
		job_type: string[];
		content_type: {
			[key: string]: string[];
		};
	};
} = {
	interview_summary: {
		interview_type: ['实习', '校招', '社招', '其它'],
		job_type: job_type_list,
		company_scale: ['小厂', '中厂', '大厂', '国央企', '外企', '其它']
		//! 不好统一，先由用户自己定
		//company_name: [],
		//turn: ['技术面', '综合面', 'HR面', '其它']
	},
	article: {
		quiz_type: ['问答题', '选择题', '力扣算法题', '其它'],
		job_type: job_type_list,
		//! llm可拓展,因此最终字段取值常量为预设加数据库查询结果。
		content_type: {
			前端: [] as string[]
		}
	}
};

interface InterviewSummaryProcessTask extends PersistentTask {
	metadata?: {
		interviewSummaryId: number;
	};
}

@Injectable()
export class InterviewSummaryService implements OnModuleInit {
	private readonly logger = new Logger(InterviewSummaryService.name);
	constructor(
		private readonly db: DbService,
		private readonly taskQueue: TaskQueueService,
		private readonly chainService: ChainService
	) {}

	onModuleInit() {
		this.taskQueue.registerTaskHandler(
			'interview-summary-process',
			this.processInterviewSummary.bind(this)
		);
	}

	/**
	 * 处理面经转换任务
	 * @param task 任务
	 */
	private async processInterviewSummary(task: InterviewSummaryProcessTask) {
		const { interviewSummaryId } = task.metadata!;
		const summary = await this.db.interview_summary.findUnique({
			where: { id: interviewSummaryId }
		});

		if (!summary) {
			throw new Error(`面经 ${interviewSummaryId} 不存在`);
		}

		// 1. 生成问题清单
		const generateChain = await this.chainService.createInterviewSummaryGenerateChain();
		const { questions } = await generateChain.invoke({
			input: summary.content,
			job_type: summary.job_type,
			company_name: summary.company_name ?? '未知',
			turn: summary.turn ?? '未知',
			interview_type: summary.interview_type ?? '未知'
		});

		// 2. 转换问题为面试题并保存
		const finalFieldEnum = await this.getFinalFieldEnum();
		const transformChain = await this.chainService.createInterviewSummaryTransformChain(
			finalFieldEnum.article.content_type
		);
		const promises = Promise.allSettled(
			questions.map(question => transformChain.invoke({ input: question }))
		);
		const results = await promises;
		for (const result of results) {
			if (result.status === 'fulfilled') {
				const articleData = result.value;
				// 1. 创建题目（不再写 user_id 字段）
				const createdArticle = await this.db.article.create({
					data: {
						...articleData,
						job_type: summary.job_type,
						interview_summary_id: summary.id,
						link: `${QuestionUrl}/${crypto.randomUUID()}`
					}
				});
				// 2. 建立用户与题目的多对多关联
				await this.db.user_article.create({
					data: {
						user_id: summary.user_id,
						article_id: createdArticle.id
					}
				});
			} else {
				this.logger.error(result.reason);
			}
		}
	}
	/**
	 * 创建面经及其对应面试题
	 * @param data 面经数据
	 * @param userId 用户ID
	 * @returns 创建的面经
	 */
	async createInterviewSummary(data: InterviewSummaryCreateDto, userInfo: UserInfoFromToken) {
		this.logger.log(data);
		const contentHash = crypto.createHash('md5').update(data.content).digest('hex');

		// 去重逻辑
		const existingSummary = await this.db.interview_summary.findFirst({
			where: {
				OR: [
					{ post_link: data.post_link || crypto.randomUUID() }, // 如果post_link为''或空值，则生成一个随机UUID避免为空判断为重复
					{ content_hash: contentHash }
				]
			}
		});

		if (existingSummary) {
			this.logger.log(existingSummary);
			throw new Error('面经已存在');
		}

		const newSummary = await this.db.interview_summary.create({
			data: {
				...data,
				post_link: data.post_link || null, //为''时存储为null以满足唯一性约束
				content_hash: contentHash,
				user_id: +userInfo.userId
			}
		});

		// 添加到任务队列，进行后续处理
		await this.taskQueue.createAndEnqueueTask(
			newSummary.id.toString(), // 使用面经id作为sessionId
			userInfo.userId.toString(),
			'interview-summary-process',
			{
				interviewSummaryId: newSummary.id
			}
		);

		return newSummary;
	}

	/**
	 * 导入面经和关联的面试题
	 * @param exporterId 导出者ID
	 * @param importerId 导入者ID
	 */
	async importSummariesAndArticles(exporterId: number, importerId: number) {
		// 1. 获取导出者的所有面经
		const summariesToExport = await this.db.interview_summary.findMany({
			where: { user_id: exporterId }
		});

		for (const summary of summariesToExport) {
			// 2. 检查导入者是否已存在此面经
			const existingSummary = await this.db.interview_summary.findFirst({
				where: {
					user_id: importerId,
					OR: [{ post_link: summary.post_link }, { content_hash: summary.content_hash }]
				}
			});

			if (existingSummary) {
				console.log(`面经 ${summary.id} 已存在于导入者，跳过`);
				continue;
			}

			// 3. 为导入者创建新面经
			const { id: oldId, user_id: oldUserId, ...summaryData } = summary;
			const newSummary = await this.db.interview_summary.create({
				data: {
					...summaryData,
					user_id: importerId
				}
			});

			// 4. 获取原面经关联的所有面试题
			const articlesToExport = await this.db.article.findMany({
				where: { interview_summary_id: summary.id }
			});

			for (const article of articlesToExport) {
				// 5. 检查导入者是否已存在此面试题
				const existingUserArticle = await this.db.user_article.findFirst({
					where: {
						user_id: importerId,
						article: {
							link: article.link
						}
					}
				});

				if (existingUserArticle) {
					console.log(`面试题 ${article.link} 已存在于导入者，跳过`);
					continue;
				}

				// 6. 为导入者创建新面试题
				const {
					id: oldArticleId,
					interview_summary_id: oldInterviewSummaryId,
					...articleData
				} = article;
				const createdArticle = await this.db.article.create({
					data: {
						...articleData,
						interview_summary_id: newSummary.id
					}
				});
				await this.db.user_article.create({
					data: {
						user_id: importerId,
						article_id: createdArticle.id
					}
				});
			}
		}
	}

	/**
	 * 获取面经及其对应面试题
	 * @param interviewSummaryId 面经ID
	 * @returns 面经及其对应面试题
	 */
	async getInterviewSummaryAndArticles(interviewSummaryId: number) {
		const summary = await this.db.interview_summary.findUnique({
			where: { id: interviewSummaryId }
		});

		if (!summary) {
			throw new Error(`面经 ${interviewSummaryId} 不存在`);
		}

		const articles = await this.db.article.findMany({
			where: { interview_summary_id: interviewSummaryId }
		});
		const summaryResult = { ...summary, articles };
		return summaryResult;
	}

	/**
	 * 获取值为枚举值的字段的取值。
	 * 获取不同job_type字段下的content_type取值。
	 */
	async getFinalFieldEnum() {
		const finalFieldEnum = {
			interview_summary: fieldEnum.interview_summary,
			article: fieldEnum.article
		};
		//先获取所有job_type
		const job_type_list = await this.getArticleFieldEnum('job_type');
		//再获取不同job_type字段下的content_type取值
		for (const job_type of job_type_list.map(item => item.job_type)) {
			//@ts-ignore
			const content_type_enum = await this.getArticleFieldEnumByJobType('content_type', job_type);
			//@ts-ignore
			finalFieldEnum.article.content_type[job_type] = content_type_enum
				.map(item => item.content_type)
				.filter(Boolean);
		}
		return finalFieldEnum;
	}

	/**
	 * 获取面经表字段的取值
	 * @param column 字段名
	 * @returns 字段取值
	 */
	private async getInterviewSummaryFieldEnum(column: Prisma.Interview_summaryScalarFieldEnum) {
		const constants = await this.db.interview_summary.findMany({
			distinct: [column],
			select: { [column]: true }
		});
		return constants;
	}
	/**
	 * 获取面试题表字段的取值
	 * @param column 字段名
	 * @returns 字段取值
	 */
	private async getArticleFieldEnum(column: Prisma.ArticleScalarFieldEnum) {
		const constants = await this.db.article.findMany({
			distinct: [column],
			select: { [column]: true }
		});
		this.logger.log(constants);
		return constants;
	}

	/**
	 * 获取面试题表字段在不同job_type下的取值
	 * @param column 字段名
	 * @param job_type 职位类型
	 * @returns 字段取值
	 */
	private async getArticleFieldEnumByJobType(
		column: Prisma.ArticleScalarFieldEnum,
		job_type: string
	) {
		const constants = await this.db.article.findMany({
			where: { job_type },
			distinct: [column],
			select: { [column]: true }
		});
		return constants;
	}
}
