import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserInfo } from '../../project/entities/project.entity';

// 学历枚举（可根据需要扩展）
export type EducationDegree = '博士' | '硕士' | '本科' | '大专' | '高中' | '其他';

@Schema({ _id: false })
export class EducationScore {
	@Prop()
	gpa?: string; // GPA(Grade Point Average，平均绩点)，保留字符串便于格式兼容

	@Prop()
	classRank?: string; // 班级/年级排名，如“前10%”
}

@Schema({ timestamps: true })
export class Education {
	// 复用用户信息子文档
	@Prop({ type: UserInfo, required: true })
	userInfo: UserInfo; // 用户信息

	@Prop({ required: true })
	school: string; // 学校名称

	@Prop({ required: true })
	major: string; // 专业名称

	@Prop({ required: true })
	degree: EducationDegree; // 学历层次

	@Prop({ required: true })
	startDate: Date; // 入学时间

	@Prop()
	endDate?: Date; // 毕业时间（在读可为空）

	@Prop({ default: true })
	visible: boolean; // 在简历中是否展示

	@Prop()
	gpa?: string; // 绩点

	@Prop()
	description?: string; //  描述（课程、奖项、社团、项目等）
}

export type EducationDocument = HydratedDocument<Education> & {
	id: string;
	createdAt: string;
	updatedAt: string;
};

export const EducationSchema = SchemaFactory.createForClass(Education);

// 输出 JSON 时追加 id 字段并移除内部字段
EducationSchema.set('toJSON', {
	versionKey: false,
	transform: function (doc, ret) {
		ret.id = ret._id.toString();
		delete ret._id;
		delete ret.__v;
		return ret;
	}
});

EducationSchema.set('toObject', {
	versionKey: false,
	virtuals: true,
	transform: function (doc, ret) {
		ret.id = ret._id.toString();
		return ret;
	}
});

// 常用检索索引
EducationSchema.index({ 'userInfo.userId': 1 });
EducationSchema.index({ 'userInfo.userId': 1, degree: 1 });
EducationSchema.index({ 'userInfo.userId': 1, school: 1 });
