import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JobStatus, JobVo, UserInfoFromToken } from '@prism-ai/shared';
import { Model } from 'mongoose';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job, JobDocument } from './entities/job.entity';

export interface PaginatedJobsResult {
	data: JobVo[];
	total: number;
	page: number;
	limit: number;
}

@Injectable()
export class JobService {
	constructor(@InjectModel(Job.name) private jobModel: Model<JobDocument>) {}

	async create(createJobDto: CreateJobDto, userInfoToken: UserInfoFromToken): Promise<Job> {
		const createdJob = new this.jobModel({
			...createJobDto,
			userInfo: userInfoToken
		});
		return createdJob.save();
	}

	async findAll(
		userInfoToken: UserInfoFromToken,
		page: number = 1,
		limit: number = 10,
		status?: JobStatus
	): Promise<PaginatedJobsResult> {
		const skip = (page - 1) * limit;
		const query = status
			? { 'userInfo.userId': userInfoToken.userId, status }
			: { 'userInfo.userId': userInfoToken.userId };
		//并行查询
		const [jobs, total] = await Promise.all([
			this.jobModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(), // 按创建日期排序
			this.jobModel.countDocuments(query).exec()
		]);

		const data = jobs.map(job => job.toObject() as JobVo);

		return {
			data,
			total,
			page,
			limit
		};
	}

	async findOne(id: string, userInfoToken: UserInfoFromToken): Promise<JobVo> {
		const job = await this.jobModel.findOne({ _id: id }).exec();
		if (!job) {
			throw new NotFoundException(`Job with ID "${id}" not found or access denied`);
		}
		return job.toObject() as JobVo;
	}

	async update(
		id: string,
		updateJobDto: UpdateJobDto,
		userInfoToken: UserInfoFromToken
	): Promise<Job> {
		const existingJob = await this.jobModel
			.findOneAndUpdate({ _id: id, 'userInfo.userId': userInfoToken.userId }, updateJobDto, {
				new: true
			})
			.exec();
		if (!existingJob) {
			throw new NotFoundException(`Job with ID "${id}" not found or access denied`);
		}
		return existingJob;
	}

	async remove(id: string, userInfoToken: UserInfoFromToken): Promise<{ message: string }> {
		const result = await this.jobModel
			.deleteOne({ _id: id, 'userInfo.userId': userInfoToken.userId })
			.exec();
		if (result.deletedCount === 0) {
			throw new NotFoundException(`Job with ID "${id}" not found or access denied`);
		}
		return { message: `Job with ID "${id}" deleted successfully` };
	}
}
