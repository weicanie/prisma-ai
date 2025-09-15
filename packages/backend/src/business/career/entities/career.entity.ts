import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserInfo } from '../../project/entities/project.entity';

@Schema({ timestamps: true })
export class Career {
	@Prop({ type: UserInfo, required: true })
	userInfo: UserInfo; // 用户信息

	@Prop({ required: true })
	company: string; // 公司名称

	@Prop({ required: true })
	position: string; // 职位名称

	@Prop({ required: true })
	startDate: Date; // 入职时间

	@Prop()
	endDate?: Date; // 离职时间（在职可为空）

	@Prop({ default: true })
	visible: boolean; // 是否在简历中展示

	@Prop()
	details?: string; // 工作职责/业绩（可富文本）
}

export type CareerDocument = HydratedDocument<Career> & {
	id: string;
	createdAt: string;
	updatedAt: string;
};

export const CareerSchema = SchemaFactory.createForClass(Career);

CareerSchema.set('toJSON', {
	versionKey: false,
	transform: function (doc, ret) {
		ret.id = ret._id.toString();
		delete ret._id;
		delete ret.__v;
		return ret;
	}
});

CareerSchema.set('toObject', {
	versionKey: false,
	virtuals: true,
	transform: function (doc, ret) {
		ret.id = ret._id.toString();
		return ret;
	}
});

CareerSchema.index({ 'userInfo.userId': 1 });
CareerSchema.index({ 'userInfo.userId': 1, company: 1 });
