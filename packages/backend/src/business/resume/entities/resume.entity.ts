import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { userInfo } from '../../project/entities/project.entity';

@Schema({ timestamps: true })
export class Resume {
	@Prop({ required: true })
	name: string; // 简历名称

	@Prop({ type: Types.ObjectId, ref: 'Skill' })
	skill: Types.ObjectId;

	@Prop({ type: [{ type: Types.ObjectId, ref: 'Project' }] })
	projects: Types.ObjectId[];

	@Prop({ type: userInfo, required: true })
	userInfo: userInfo;
}

export type ResumeDocument = HydratedDocument<Resume>;
export const ResumeSchema = SchemaFactory.createForClass(Resume);

ResumeSchema.set('toJSON', {
	versionKey: false,
	transform: function (doc, ret) {
		ret.id = ret._id.toString(); // Convert _id to id string
		delete ret._id;
	}
});

ResumeSchema.index({ 'userInfo.userId': 1 });
ResumeSchema.index({ 'userInfo.userId': 1, name: 1 }, { unique: true });
