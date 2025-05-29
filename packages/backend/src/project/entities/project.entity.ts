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
export class userInfo {
	@Prop({ required: true })
	userId: string;

	@Prop({ required: true })
	username: string;
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
	userInfo: userInfo; // 用户信息
}

export type ProjectDocument = HydratedDocument<Project>;

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.set('toJSON', {
	versionKey: false,
	transform: function (doc, ret) {
		ret.id = ret._id.toString(); // Convert _id to id string
		delete ret._id;
	}
});

ProjectSchema.index({ 'userInfo.userId': 1 });
ProjectSchema.index({ 'userInfo.userId': 1, status: 1 });

// 保存后钩子（中间件）
ProjectSchema.post('save', function (this: ProjectDocument) {
	//TODO 添加日志
	console.log(`${this.status}的项目经验保存:`, this);
});
