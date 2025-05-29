import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { userInfo } from '../../project/entities/project.entity';

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

	@Prop({ type: userInfo, required: true })
	userInfo: userInfo; //用户信息
}

export type JobDocument = HydratedDocument<Job>; //Job & Document
export const JobSchema = SchemaFactory.createForClass(Job);

JobSchema.set('toJSON', {
	versionKey: false,
	transform: function (doc, ret) {
		ret.id = ret._id.toString(); // Convert _id to id string
		delete ret._id;
	}
});

JobSchema.index({ 'userInfo.userId': 1 });
JobSchema.index({ location: 1 });
JobSchema.index({ companyName: 1 });
