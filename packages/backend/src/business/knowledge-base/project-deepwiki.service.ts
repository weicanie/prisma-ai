import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	CreateProjectDeepWikiKnowledgeDto,
	DeepWikiKnowledgeDto,
	FileTypeEnum,
	UserInfoFromToken
} from '@prisma-ai/shared';
import fs from 'fs';
import { Model } from 'mongoose';
import path from 'path';
import { EventBusService, EventList } from '../../EventBus/event-bus.service';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { PersistentTask } from '../../type/taskqueue';
import { deepwikiDownScriptPath, user_data_dir } from '../../utils/constants';
import { executeShellScript } from '../../utils/execute_shell_script';
import { KnowledgeVDBService } from '../prisma-agent/data_base/konwledge_vdb.service';
import { Knowledgebase, KnowledgebaseDocument } from './entities/knowledge-base.entity';
import { KnowledgebaseService } from './knowledge-base.service';

interface DownloadDeepWikiTask extends PersistentTask {
	metadata: {
		param: {
			dto: DeepWikiKnowledgeDto;
		};
		progress: {
			done: boolean;
		};
	};
}

interface UploadDeepWikiToKnowledgeBaseTask extends PersistentTask {
	metadata: {
		param: {
			dto: CreateProjectDeepWikiKnowledgeDto;
			userInfo: UserInfoFromToken;
		};
		progress: {
			done: boolean;
		};
	};
}

/**
 * 项目deepWiki知识库服务。
 * 功能：将项目deepwiki网站内容转换为项目知识库。
 * @method downloadDeepWiki: 将项目deepwiki网站转换为md保存到本地
 * @method uploadDeepWikiToKnowledgeBase: 将本地md上传到知识库
 */
@Injectable()
export class ProjectDeepWikiService implements OnModuleInit {
	@InjectModel(Knowledgebase.name)
	private knowledgebaseModel: Model<KnowledgebaseDocument>;
	constructor(
		private readonly knowledgeVDBService: KnowledgeVDBService,
		private readonly knowledgebaseService: KnowledgebaseService,
		private readonly taskQueueService: TaskQueueService,
		private readonly eventBusService: EventBusService
	) {}

	onModuleInit() {
		this.taskQueueService.registerTaskHandler('downloadDeepWiki', this.downloadDeepWiki.bind(this));
		this.taskQueueService.registerTaskHandler(
			'uploadDeepWikiToKnowledgeBase',
			this.uploadDeepWikiToKnowledgeBase.bind(this)
		);
	}

	/**
	 * 将项目deepwiki站点内容转换为md文件下载到本地
	 * @param wikiUrl 项目deepwiki站点地址
	 */
	async downloadDeepWiki(task: DownloadDeepWikiTask) {
		try {
			await executeShellScript(deepwikiDownScriptPath, [task.metadata.param.dto.wikiUrl]);
		} catch (error) {
			throw new Error('下载deepwiki失败');
		}
		// 更新任务进度
		const newTask: DownloadDeepWikiTask = {
			...task,
			metadata: {
				...task.metadata,
				progress: {
					done: true
				}
			}
		};
		await this.taskQueueService.saveTask(newTask);
	}

	/**
	 * 将本地md上传到知识库
	 * @param wikiUrl 项目deepwiki站点地址
	 */
	async uploadDeepWikiToKnowledgeBase(task: UploadDeepWikiToKnowledgeBaseTask) {
		const { dto, userInfo } = task.metadata.param;
		// 清理url末尾的/
		let cleanedUrl = dto.wikiUrl.trim();
		if (cleanedUrl[cleanedUrl.length - 1] === '/') {
			cleanedUrl = cleanedUrl.slice(0, -1);
		}
		const items = cleanedUrl.split('/');
		const organization = items[items.length - 2];
		const repository = items[items.length - 1];
		if (!organization || !repository) {
			throw new Error('deepwiki站点地址格式错误');
		}
		const mdFileDirPath = path.join(
			user_data_dir.deepwikiDownOutputPath(userInfo.userId),
			'wiki',
			organization,
			repository
		);
		// 获取md文件
		const mdFiles = fs.readdirSync(mdFileDirPath);
		const vectorIds: string[] = [];
		// md文件上传到向量数据库
		for (const mdFile of mdFiles) {
			const mdFilePath = path.join(mdFileDirPath, mdFile);
			const mdFileContent = fs.readFileSync(mdFilePath, 'utf8');
			const vectorIdsOfFile = await this.knowledgeVDBService.storeDeepWikiToVDB(
				{ ...dto, content: mdFileContent },
				userInfo
			);
			vectorIds.push(...vectorIdsOfFile);
		}
		// 储存知识和关联的向量id到数据库
		const createdKnowledgebase = await this.knowledgebaseService.create(
			{ ...dto, fileType: FileTypeEnum.url, tag: ['deepwiki'], content: dto.wikiUrl },
			userInfo
		);
		await this.knowledgebaseModel.findByIdAndUpdate(createdKnowledgebase.id, { vectorIds });

		// 更新任务进度
		const newTask: UploadDeepWikiToKnowledgeBaseTask = {
			...task,
			metadata: {
				...task.metadata,
				progress: {
					done: true
				}
			}
		};
		await this.taskQueueService.saveTask(newTask);
		// 失效项目检索到的文档和代码的缓存
		this.eventBusService.emit(EventList.cacheProjectRetrievedDocAndCodeInvalidate, {
			projectName: dto.projectName,
			userId: userInfo.userId
		});
	}
}
