import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class ProjectDesc {
	@Prop({ required: false })
	role: string; // 在项目中的角色和职责

	@Prop({ required: false })
	contribute: string; // 核心贡献和参与程度

	@Prop({ required: false })
	bgAndTarget: string; // 项目的背景和目的
}

@Schema()
export class ProjectInfo {
	@Prop({ required: false })
	name: string; // 项目名称

	@Prop({ type: ProjectDesc, required: false })
	desc: ProjectDesc;

	@Prop({ type: [String], required: false })
	techStack: string[]; // 项目技术栈
}

@Schema()
export class ProjectLightspot {
	@Prop({ type: [String], required: false })
	team: string[]; // 团队贡献

	@Prop({ type: [String], required: false })
	skill: string[]; // 技术亮点/难点

	@Prop({ type: [String], required: false })
	user: string[]; // 用户体验/业务价值
}

@Schema()
export class userInfo {
	@Prop({ required: false })
	userId: string;

	@Prop({ required: false })
	username: string;
}

@Schema()
export class Project {
	@Prop({ type: ProjectInfo, required: false })
	info: ProjectInfo; //项目信息

	@Prop({ type: ProjectLightspot, required: false })
	lightspot: ProjectLightspot; //项目亮点

	@Prop({ required: false })
	status: string; // 项目状态

	@Prop({ required: false })
	userInfo: userInfo; // 项目状态
}

export type ProjectDocument = HydratedDocument<Project>;

export const ProjectSchema = SchemaFactory.createForClass(Project);
