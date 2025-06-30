import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	CreateKnowledgeDto,
	FileTypeEnum,
	KnowledgeTypeEnum,
	KnowledgeVo,
	PaginatedKnsResult,
	UpdateKnowledgeDto,
	UserInfoFromToken
} from '@prism-ai/shared';
import { Model, Types } from 'mongoose';
import * as path from 'path';
import { OssService } from '../../oss/oss.service';
import { KnowledgeVDBService } from '../../prisma-agent/data_base/konwledge_vdb.service';
import { ProjectCodeVDBService } from '../../prisma-agent/data_base/project_code_vdb.service';
import { cloneProjectScriptPath, projectsDirPath } from '../../utils/constants';
import { executeShellScript } from '../../utils/execute_shell_script';
import { getOssObjectNameFromURL } from '../../utils/getOssObjectNameFromURL';
import { Knowledgebase, KnowledgebaseDocument } from './entities/knowledge-base.entity';

@Injectable()
export class KnowledgebaseService {
	@InjectModel(Knowledgebase.name)
	private knowledgebaseModel: Model<KnowledgebaseDocument>;
	constructor(
		private ossService: OssService,
		private knowledgeVDBService: KnowledgeVDBService,
		private projectCodeVDBService: ProjectCodeVDBService
	) {}

	/**
	 * 存储知识到数据库,文档则上传到oss
	 * 并调用prisma-agent的KnowledgeVDBService存储到向量数据库
	 * oss中文档的命名规则: 知识名称-用户id
	 */
	async create(
		createKnowledgeDto: CreateKnowledgeDto,
		userInfo: UserInfoFromToken
	): Promise<KnowledgeVo> {
		//如果是文档,则验证文档是否上传OSS
		if (createKnowledgeDto.fileType === FileTypeEnum.doc) {
			const fileObjName = getOssObjectNameFromURL(createKnowledgeDto.content);
			const fileExists = await this.ossService.checkFileExists(fileObjName!);
			if (!fileExists) {
				throw new Error('文件不存在,请不要修改知识内容中的URL');
			}
		}
		const createdKnowledgebase = new this.knowledgebaseModel({
			...createKnowledgeDto,
			userInfo
		});

		const saved = await createdKnowledgebase.save();
		const embedKnowledgeDto = {
			id: (saved._id as Types.ObjectId).toString(),
			name: saved.name,
			type: saved.type,
			fileType: saved.fileType,
			tag: saved.tag,
			content: saved.content,
			createdAt: saved.createdAt,
			updatedAt: saved.updatedAt
		};

		if (
			createKnowledgeDto.type === KnowledgeTypeEnum.userProjectCode ||
			createKnowledgeDto.type === KnowledgeTypeEnum.openSourceProjectRepo
		) {
			//代码库
			this.storeCodeToVDB(createKnowledgeDto.content, userInfo);
		} else {
			//文档库
			this.knowledgeVDBService.storeKnowledgeToVDB(embedKnowledgeDto, userInfo);
		}

		return embedKnowledgeDto as KnowledgeVo;
	}

	/**
	 * 用户clone项目到指定目录并上传项目代码到向量数据库
	 * @param projectRepoPath 项目仓库地址
	 * @param userInfo 用户信息
	 */
	async storeCodeToVDB(projectRepoPath: string, userInfo: UserInfoFromToken) {
		const projectName = path.basename(projectRepoPath).replace('.git', '');
		//clone项目到指定目录
		await executeShellScript(cloneProjectScriptPath, [
			projectRepoPath,
			`${projectsDirPath}/${projectName}`
		]);
		//上传项目代码到向量数据库
		const projectPath = path.resolve(projectsDirPath, projectName);
		await this.projectCodeVDBService.storeToVDB(
			userInfo.userId,
			projectName,
			projectPath,
			crypto.randomUUID()
		);
	}

	async findAll(
		userInfo: UserInfoFromToken,
		page: number = 1,
		limit: number = 10
	): Promise<PaginatedKnsResult> {
		const skip = (page - 1) * limit;
		const query = { 'userInfo.userId': userInfo.userId };

		const [result, total] = await Promise.all([
			this.knowledgebaseModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
			this.knowledgebaseModel.countDocuments(query).exec()
		]);

		const data = result.map(
			kn =>
				({
					id: (kn._id as Types.ObjectId).toString(),
					name: kn.name,
					type: kn.type,
					fileType: kn.fileType,
					tag: kn.tag,
					content: kn.content,
					createdAt: kn.createdAt,
					updatedAt: kn.updatedAt
				}) as KnowledgeVo
		);
		return {
			data,
			total,
			page,
			limit
		};
	}

	async findOne(id: string, userInfo: UserInfoFromToken): Promise<KnowledgeVo> {
		const kn = await this.knowledgebaseModel
			.findOne({
				_id: new Types.ObjectId(id),
				'userInfo.userId': userInfo.userId
			})
			.exec();
		if (!kn) {
			throw new NotFoundException(`Knowledgebase with ID "${id}" not found`);
		}
		return {
			id: (kn._id as Types.ObjectId).toString(),
			name: kn.name,
			type: kn.type,
			fileType: kn.fileType,
			tag: kn.tag,
			content: kn.content,
			createdAt: kn.createdAt,
			updatedAt: kn.updatedAt
		} as KnowledgeVo;
	}

	async update(
		id: string,
		updateKnowledgeDto: UpdateKnowledgeDto,
		userInfo: UserInfoFromToken
	): Promise<KnowledgeVo> {
		const existingkn = await this.knowledgebaseModel
			.findOneAndUpdate(
				{ _id: new Types.ObjectId(id), 'userInfo.userId': userInfo.userId },
				updateKnowledgeDto,
				{ new: true }
			)
			.exec();
		if (!existingkn) {
			throw new NotFoundException(`Knowledgebase with ID "${id}" not found`);
		}
		return {
			id: (existingkn._id as Types.ObjectId).toString(),
			name: existingkn.name,
			type: existingkn.type,
			fileType: existingkn.fileType,
			tag: existingkn.tag,
			content: existingkn.content,
			createdAt: existingkn.createdAt,
			updatedAt: existingkn.updatedAt
		} as KnowledgeVo;
	}

	async remove(id: string, userInfo: UserInfoFromToken): Promise<void> {
		const result = await this.knowledgebaseModel
			.deleteOne({
				_id: new Types.ObjectId(id),
				'userInfo.userId': userInfo.userId
			})
			.exec();
		if (result.deletedCount === 0) {
			throw new NotFoundException(`Knowledgebase with ID "${id}" not found`);
		}
	}
}
