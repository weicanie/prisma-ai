import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserInfoFromToken } from '@prism-ai/shared';
import { Model, Types } from 'mongoose';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Resume, ResumeDocument } from './entities/resume.entity';

export interface PaginatedResumesResult {
	data: Resume[];
	total: number;
	page: number;
	limit: number;
}

@Injectable()
export class ResumeService {
	constructor(@InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>) {}

	async create(createResumeDto: CreateResumeDto, userInfo: UserInfoFromToken): Promise<Resume> {
		const createdResume = new this.resumeModel({
			...createResumeDto,
			skills: createResumeDto.skills?.map(id => new Types.ObjectId(id)),
			projects: createResumeDto.projects?.map(id => new Types.ObjectId(id)),
			userInfo
		});
		return createdResume.save();
	}

	async findAll(
		userInfo: UserInfoFromToken,
		page: number = 1,
		limit: number = 10
	): Promise<PaginatedResumesResult> {
		const skip = (page - 1) * limit;
		const query = { 'userInfo.userId': userInfo.userId };

		const [data, total] = await Promise.all([
			this.resumeModel
				.find(query)
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 })
				.populate('skills')
				.populate('projects')
				.exec(),
			this.resumeModel.countDocuments(query).exec()
		]);

		return {
			data,
			total,
			page,
			limit
		};
	}
	//FIXME : Promise<ResumeVo> 类型异常
	async findOne(id: string, userInfo: UserInfoFromToken) {
		if (!Types.ObjectId.isValid(id)) {
			throw new NotFoundException(`Invalid ID format: "${id}"`);
		}
		const resume = await this.resumeModel
			.findOne({ _id: new Types.ObjectId(id), 'userInfo.userId': userInfo.userId })
			.populate('skills')
			.populate('projects')
			.exec();
		if (!resume) {
			throw new NotFoundException(`Resume with ID "${id}" not found or access denied`);
		}
		//运行时id必定存在
		return resume;
	}
	//FIXME : Promise<ResumeVo> 类型异常
	async update(id: string, updateResumeDto: UpdateResumeDto, userInfo: UserInfoFromToken) {
		if (!Types.ObjectId.isValid(id)) {
			throw new NotFoundException(`Invalid ID format: "${id}"`);
		}
		const updateData: any = { ...updateResumeDto };
		if (updateResumeDto.skills) {
			updateData.skills = updateResumeDto.skills.map(skillId => new Types.ObjectId(skillId));
		}
		if (updateResumeDto.projects) {
			updateData.projects = updateResumeDto.projects.map(
				projectId => new Types.ObjectId(projectId)
			);
		}

		const existingResume = await this.resumeModel
			.findOneAndUpdate(
				{ _id: new Types.ObjectId(id), 'userInfo.userId': userInfo.userId },
				updateData,
				{ new: true }
			)
			.populate('skill')
			.populate('projects')
			.exec();

		if (!existingResume) {
			throw new NotFoundException(`Resume with ID "${id}" not found or access denied`);
		}
		//运行时id必定存在
		return existingResume;
	}

	async remove(id: string, userInfo: UserInfoFromToken): Promise<{ message: string }> {
		if (!Types.ObjectId.isValid(id)) {
			throw new NotFoundException(`Invalid ID format: "${id}"`);
		}
		const result = await this.resumeModel
			.deleteOne({ _id: new Types.ObjectId(id), 'userInfo.userId': userInfo.userId })
			.exec();
		if (result.deletedCount === 0) {
			throw new NotFoundException(`Resume with ID "${id}" not found or access denied`);
		}
		return { message: `Resume with ID "${id}" deleted successfully` };
	}
}
