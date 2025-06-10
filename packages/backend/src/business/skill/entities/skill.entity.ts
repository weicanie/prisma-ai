import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserInfo } from '../../project/entities/project.entity';

@Schema()
export class SkillItem {
	@Prop({ required: false })
	type?: string;

	@Prop({ type: [String], required: true })
	content: string[];
}

@Schema({ timestamps: true })
export class Skill {
	@Prop({ required: true })
	name: string; // 技能清单名称

	@Prop({ type: [SkillItem], required: true })
	content: SkillItem[]; // 职业技能描述

	@Prop({ type: UserInfo, required: true })
	userInfo: UserInfo; // 用户信息
}

export type SkillDocument = HydratedDocument<Skill> & {
	id: string;
	createdAt: string;
	updatedAt: string;
};
export const SkillSchema = SchemaFactory.createForClass(Skill);

SkillSchema.set('toJSON', {
	versionKey: false,
	transform: function (doc, ret) {
		ret.id = ret._id.toString(); // Convert _id to id string
		delete ret._id;
	}
});

SkillSchema.index({ 'userInfo.userId': 1 });
