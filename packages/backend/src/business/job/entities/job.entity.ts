import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { JobOpenStatus, JobStatus } from '@prisma-ai/shared';
import { HydratedDocument, Types } from 'mongoose';
import { UserInfo } from '../../project/entities/project.entity';

@Schema({ timestamps: true })
export class Recall {
	@Prop({ type: Types.ObjectId, ref: 'Job' })
	resumeId: Types.ObjectId;

	@Prop({ type: String, trim: true })
	reason?: string; //匹配原因
}

@Schema({ timestamps: true })
export class Job {
	@Prop({
		type: String,
		required: true,
		trim: true,
		index: true
	})
	jobName: string; //职位名称

	@Prop({
		type: String,
		required: true,
		trim: true,
		index: true
	})
	companyName: string; //公司名

	@Prop({
		type: String,
		required: true
	})
	description: string; //职位描述

	@Prop({
		type: String,
		trim: true,
		index: true
	})
	location?: string; //所在区域

	@Prop({
		type: String,
		trim: true
	})
	salary?: string; //薪资

	@Prop({
		type: String,
		trim: true
	})
	link?: string; //详情页链接

	@Prop({ type: UserInfo, required: true })
	userInfo: UserInfo; //用户信息

	@Prop({
		type: String,
		trim: true,
		default: JobOpenStatus.OPEN
	})
	job_status?: string; //职位外界状态， "open", "closed"

	@Prop({
		type: String,
		trim: true,
		default: JobStatus.COMMITTED
	})
	status?: string; //职位内部状态，"committed", "embedded", "matched" 未处理、已embedding、已被用户简历追踪

	/* 专用简历追踪的岗位 */
	@Prop({ type: Types.ObjectId, ref: 'ResumeMatched' })
	resumeMatchedId?: Types.ObjectId;

	/* 简历匹配的岗位:一份简历匹配多个岗位 */
	@Prop({
		type: [Recall]
	})
	recall?: Recall[]; //记录被哪些简历匹配及匹配原因的数组（匹配=召回+重排）
}

export type JobDocument = HydratedDocument<Job> & {
	id: string;
	createdAt: string;
	updatedAt: string;
};
export const JobSchema = SchemaFactory.createForClass(Job);

JobSchema.pre('save', async function (this: JobDocument) {
	if (this.status && this.status !== 'open' && this.status !== 'closed') {
		throw new Error('Invalid status value. Must be "open" or "closed".');
	}
	if (!this.status) {
		this.status = 'open';
	}
});

JobSchema.set('toJSON', {
	versionKey: false,
	transform: function (doc, ret) {
		ret.id = ret._id.toString(); // Convert _id to id string
		delete ret._id;
		return ret;
	}
});

JobSchema.set('toObject', {
	transform: function (doc, ret) {
		ret.id = ret._id.toString(); // Convert _id to id string
		delete ret._id;
		return ret;
	}
});

JobSchema.index({ 'userInfo.userId': 1 });
