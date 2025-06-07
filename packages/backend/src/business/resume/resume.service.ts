import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginatedResumesResult, ResumeVo, UserInfoFromToken } from '@prism-ai/shared';
import { Model, Types } from 'mongoose';
import { PopulateFields } from '../../utils/type';
import { ProjectDocument } from '../project/entities/project.entity';
import { SkillDocument } from '../skill/entities/skill.entity';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Resume, ResumeDocument } from './entities/resume.entity';

@Injectable()
export class ResumeService {
	@InjectModel(Resume.name)
	private resumeModel: Model<ResumeDocument>;

	constructor() {}

	async create(createResumeDto: CreateResumeDto, userInfo: UserInfoFromToken): Promise<Resume> {
		const createdResume = new this.resumeModel({
			...createResumeDto,
			skill: new Types.ObjectId(createResumeDto.skill),
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

		const [result, total] = await Promise.all([
			this.resumeModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
			this.resumeModel.countDocuments(query).exec()
		]);

		const promises = result.map(resume => this.findOne(resume._id.toString(), userInfo));
		let data = await Promise.all(promises);
		return {
			data,
			total,
			page,
			limit
		};
	}
	async findOne(id: string, userInfo: UserInfoFromToken): Promise<ResumeVo> {
		if (!Types.ObjectId.isValid(id)) {
			throw new NotFoundException(`Invalid ID format: "${id}"`);
		}
		const resume = (await this.resumeModel
			.findOne({ _id: new Types.ObjectId(id), 'userInfo.userId': userInfo.userId })
			.populate('skill')
			.populate('projects')
			.exec()) as PopulateFields<
			ResumeDocument,
			'projects' | 'skill',
			{
				projects: ProjectDocument[];
				skill: SkillDocument;
			}
		> | null;

		if (!resume) {
			throw new NotFoundException(`Resume with ID "${id}" not found or access denied`);
		}

		const result = { ...resume.toObject() };

		return result as unknown as PopulateFields<ResumeDocument, 'projects' | 'skill', ResumeVo>;
	}

	async update(
		id: string,
		updateResumeDto: UpdateResumeDto,
		userInfo: UserInfoFromToken
	): Promise<ResumeVo> {
		if (!Types.ObjectId.isValid(id)) {
			throw new NotFoundException(`Invalid ID format: "${id}"`);
		}
		const updateData: any = { ...updateResumeDto };
		if (updateResumeDto.skill) {
			updateData.skill = new Types.ObjectId(updateResumeDto.skill);
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
			.exec();

		if (!existingResume) {
			throw new NotFoundException(`Resume with ID "${id}" not found or access denied`);
		}

		const newResume = this.findOne(id, userInfo);

		return newResume;
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
