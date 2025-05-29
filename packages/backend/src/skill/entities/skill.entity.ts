import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { userInfo } from '../../project/entities/project.entity';

@Schema()
export class SkillItem {
	@Prop({ required: false })
	type?: string;

	@Prop({ type: [String], required: true })
	content: string[];
}

@Schema({ timestamps: true })
export class Skill {
	@Prop({ type: [SkillItem], required: true })
	content: SkillItem[]; // 职业技能描述

	@Prop({ type: userInfo, required: true })
	userInfo: userInfo; // 用户信息
}

export type SkillDocument = HydratedDocument<Skill>;
export const SkillSchema = SchemaFactory.createForClass(Skill);

SkillSchema.set('toJSON', {
	versionKey: false,
	transform: function (doc, ret) {
		ret.id = ret._id.toString(); // Convert _id to id string
		delete ret._id;
	}
});

SkillSchema.index({ 'userInfo.userId': 1 });
