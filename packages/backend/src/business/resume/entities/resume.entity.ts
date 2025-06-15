import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ResumeStatus } from '@prism-ai/shared';
import { HydratedDocument, Types } from 'mongoose';
import { UserInfo } from '../../project/entities/project.entity';

@Schema({ timestamps: true })
export class Resume {
  @Prop({ required: true })
  name: string; // 简历名称

  @Prop({ type: Types.ObjectId, ref: 'Skill' })
  skill: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Project' }] })
  projects: Types.ObjectId[];

  @Prop({ type: UserInfo, required: true })
  userInfo: UserInfo;

  @Prop({ type: String, enum: ResumeStatus, default: ResumeStatus.committed })
  status: ResumeStatus;

  /* 一对多：一份简历 对应多个专用简历 (一份简历可以追踪多个岗位) */
  @Prop({ type: [{ type: Types.ObjectId, ref: 'ResumeMatched', default: [] }] })
  resumeMatcheds?: Types.ObjectId[];
}

export type ResumeDocument = HydratedDocument<Resume> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
export const ResumeSchema = SchemaFactory.createForClass(Resume);

ResumeSchema.set('toJSON', {
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});
ResumeSchema.set('toObject', {
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

ResumeSchema.index({ 'userInfo.userId': 1 });
ResumeSchema.index({ 'userInfo.userId': 1, name: 1 }, { unique: true });
