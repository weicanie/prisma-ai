import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ResumeStatus } from '@prisma-ai/shared';
import { HydratedDocument, Types } from 'mongoose';
import { Project, UserInfo } from '../../project/entities/project.entity';
import { Skill } from '../../skill/entities/skill.entity';
@Schema({ timestamps: true })
export class ResumeMatched {
	@Prop({ required: true })
	name: string; // 简历名称

	@Prop({ type: Skill })
	skill: Skill;

	@Prop({ type: [Project] })
	projects: Project[];

	@Prop({ type: UserInfo, required: true })
	userInfo: UserInfo;

	@Prop({ type: String, enum: ResumeStatus, default: ResumeStatus.committed })
	status: ResumeStatus;
	/* 一对一：一份专用简历 对应一个岗位 */

	@Prop({ type: Types.ObjectId, ref: 'Job', required: true })
	jobId: Types.ObjectId;
}

export type ResumeMatchedDocument = HydratedDocument<ResumeMatched> & {
	id: string;
	createdAt: string;
	updatedAt: string;
};
export const ResumeMatchedSchema = SchemaFactory.createForClass(ResumeMatched);

ResumeMatchedSchema.set('toJSON', {
	versionKey: false,
	transform: function (doc, ret) {
		ret.id = ret._id.toString();
		delete ret._id;
		return ret;
	}
});
ResumeMatchedSchema.set('toObject', {
	versionKey: false,
	transform: function (doc, ret) {
		ret.id = ret._id.toString();
		delete ret._id;
		return ret;
	}
});

ResumeMatchedSchema.index({ 'userInfo.userId': 1, name: 1 });
ResumeMatchedSchema.index({ 'userInfo.userId': 1 });
