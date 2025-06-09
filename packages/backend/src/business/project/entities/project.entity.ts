import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class ProjectDesc {
	@Prop()
	role?: string; // 在项目中的角色和职责

	@Prop()
	contribute?: string; // 核心贡献和参与程度

	@Prop()
	bgAndTarget?: string; // 项目的背景和目的
}

@Schema()
export class ProjectInfo {
	@Prop({ required: true })
	name: string; // 项目名称

	@Prop({ type: ProjectDesc })
	desc?: ProjectDesc;

	@Prop({ type: [String], required: true })
	techStack: string[]; // 项目技术栈
}

@Schema()
export class ProjectLightspot {
	@Prop({ type: [String] })
	team?: string[]; // 团队贡献

	@Prop({ type: [String], required: true })
	skill: string[]; // 技术亮点/难点

	@Prop({ type: [String] })
	user?: string[]; // 用户体验/业务价值
}

@Schema()
export class UserInfo {
	@Prop({ required: true })
	userId: string;

	@Prop({ required: true })
	username: string;
}

//TODO lookup分表改为嵌套文档
@Schema()
export class Problem {
	@Prop({ required: true })
	name: string; // 问题名称

	@Prop({ required: true })
	desc: string; // 问题描述
}

@Schema()
export class Solution {
	@Prop({ required: true })
	name: string; // 解决方案名称

	@Prop({ required: true })
	desc: string; // 解决方案描述
}

@Schema({ timestamps: true })
export class LookupResult {
	@Prop({ type: [SchemaFactory.createForClass(Problem)], default: [] })
	problem: Problem[]; // 存在的问题

	@Prop({ type: [SchemaFactory.createForClass(Solution)], default: [] })
	solution: Solution[]; // 解决方案

	@Prop({ default: 80 })
	score: number; // 项目描述评分, 0-100分
}

@Schema({ timestamps: true })
export class Project {
	@Prop({ type: ProjectInfo, required: true })
	info: ProjectInfo; //项目信息

	@Prop({ type: ProjectLightspot, required: true })
	lightspot: ProjectLightspot; //项目亮点

	@Prop({ required: true })
	status: string; // 项目状态

	@Prop({ required: true })
	userInfo: UserInfo; // 用户信息
	//分析结果（lookup后具有）
	@Prop({ type: LookupResult })
	lookupResult?: LookupResult;
}

export type ProjectDocument = HydratedDocument<Project> & {
	id: string;
	createdAt: string;
	updatedAt: string;
};

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.set('toJSON', {
	versionKey: false,
	transform: function (doc, ret) {
		ret.id = ret._id.toString();
		ret.name = ret.info.name;
		delete ret._id;
		delete ret.__v;
		return ret;
	}
});

ProjectSchema.set('toObject', {
	versionKey: false,
	virtuals: true,
	transform: function (doc, ret, options) {
		ret.id = ret._id.toString();
		ret.name = ret.info.name;
		return ret;
	}
});

ProjectSchema.index({ 'userInfo.userId': 1 });
ProjectSchema.index({ 'userInfo.userId': 1, 'info.name': 1 });
ProjectSchema.index({ 'userInfo.userId': 1, status: 1 });

ProjectSchema.pre('save', function (this: ProjectDocument) {
	if (this.status === 'polishing' || this.status === 'mining') {
		throw new Error('项目状态不能为 polishing 或 mining');
	}
});

ProjectSchema.post('save', function (this: ProjectDocument) {
	//TODO 添加日志
	console.log(`mongodb:${this.status}的项目经验保存:`, this.info.name);
});
