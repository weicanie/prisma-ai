import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JobStatus, JobVo, MatchedJobVo, UserInfoFromToken } from '@prisma-ai/shared';
import { Model } from 'mongoose';
import { EventBusService, EventList } from '../../EventBus/event-bus.service';
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
	constructor(
		@InjectModel(Job.name) private jobModel: Model<JobDocument>,
		private readonly eventBusService: EventBusService
	) {}

	async create(createJobDto: CreateJobDto, userInfoToken: UserInfoFromToken): Promise<Job> {
		const createdJob = new this.jobModel({
			...createJobDto,
			userInfo: userInfoToken
		});
		const savedJob = await createdJob.save();
		/* 更新用户记忆 */
		this.eventBusService.emit(EventList.userMemoryChange, {
			userInfo: userInfoToken,
			job: createJobDto
		});
		return savedJob;
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

	/**
	 * 将爬虫抓取的岗位成为用户追踪的岗位
	 * @param jobId 岗位id
	 * @param userInfo 用户信息
	 * @returns 岗位
	 */
	async becomeUserJob(jobId: string, userInfo: UserInfoFromToken): Promise<Job> {
		const job = await this.jobModel.findOne({ _id: jobId }).exec();
		if (!job) {
			throw new NotFoundException(`Job with ID "${jobId}" not found or access denied`);
		}
		this.jobModel.updateOne({ _id: jobId }, { $set: { userInfo } }, { new: true }).exec();
		/* 更新用户记忆 */
		this.eventBusService.emit(EventList.userMemoryChange, {
			userInfo: userInfo,
			job: job.toObject() as CreateJobDto
		});
		return job;
	}

	async findOne(id: string, userInfoToken: UserInfoFromToken): Promise<JobVo> {
		const job = await this.jobModel.findOne({ _id: id }).exec();
		if (!job) {
			throw new NotFoundException(`Job with ID "${id}" not found or access denied`);
		}
		return job.toObject() as JobVo;
	}

	/**
	 * 查询简历匹配的所有岗位
	 * @param resumeId 简历id
	 * @param userInfo
	 */
	async findAllMatched(resumeId: string, userInfo: UserInfoFromToken): Promise<MatchedJobVo[]> {
		const query = {
			'userInfo.userId': userInfo.userId,
			recall: { $elemMatch: { resumeId: resumeId } }
		};

		const matchedJobVos = await this.jobModel.find(query).sort({ createdAt: -1 }).exec();

		const jobsWithReason = matchedJobVos.map(job => {
			const jobObject = job.toObject() as JobVo;

			// Find the specific recall entry for this resumeId
			const recallEntry = job.recall?.find(r => r.resumeId.toString() === resumeId);

			return {
				...jobObject,
				reason: recallEntry?.reason
			};
		});

		return jobsWithReason;
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
