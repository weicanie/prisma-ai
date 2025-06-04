import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	CreateKnowledgeDto,
	KnowledgeVo,
	PaginatedKnsResult,
	UpdateKnowledgeDto,
	UserInfoFromToken
} from '@prism-ai/shared';
import { Model, Types } from 'mongoose';
import { Knowledgebase, KnowledgebaseDocument } from './entities/knowledge-base.entity';

@Injectable()
export class KnowledgebaseService {
	constructor(
		@InjectModel(Knowledgebase.name) private knowledgebaseModel: Model<KnowledgebaseDocument>
	) {}

	async create(
		createKnowledgeDto: CreateKnowledgeDto,
		userInfo: UserInfoFromToken
	): Promise<KnowledgeVo> {
		const createdKnowledgebase = new this.knowledgebaseModel({
			...createKnowledgeDto,
			userInfo
		});
		const saved = await createdKnowledgebase.save();
		return {
			id: (saved._id as Types.ObjectId).toString(),
			name: saved.name,
			type: saved.type,
			fileType: saved.fileType,
			tag: saved.tag,
			content: saved.content,
			createdAt: saved.createdAt,
			updatedAt: saved.updatedAt
		} as KnowledgeVo;
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
			.findOne({ _id: new Types.ObjectId(id), 'userInfo.userId': userInfo.userId })
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
			.deleteOne({ _id: new Types.ObjectId(id), 'userInfo.userId': userInfo.userId })
			.exec();
		if (result.deletedCount === 0) {
			throw new NotFoundException(`Knowledgebase with ID "${id}" not found`);
		}
	}
}
