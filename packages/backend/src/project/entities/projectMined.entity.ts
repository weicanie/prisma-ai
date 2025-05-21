import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProjectInfo, ProjectLightspot, userInfo } from './project.entity';

@Schema()
export class LightspotAdded {
	@Prop({ required: true })
	content: string; // 亮点内容

	@Prop({ required: true })
	reason: string; // 亮点添加原因

	@Prop({ type: [String], required: true })
	tech: string[]; // 涉及技术
}

@Schema()
export class ProjectLightspotAdded {
	@Prop({ type: [LightspotAdded], required: false })
	team: LightspotAdded[]; // 团队贡献

	@Prop({ type: [LightspotAdded], required: false })
	skill: LightspotAdded[]; // 技术亮点/难点

	@Prop({ type: [LightspotAdded], required: false })
	user: LightspotAdded[]; // 用户体验/业务价值
}

@Schema()
export class ProjectMined {
	@Prop({ type: ProjectInfo, required: false })
	info: ProjectInfo; // 复用ProjectInfo

	@Prop({ type: ProjectLightspot, required: false })
	lightspot: ProjectLightspot; // 原始亮点

	@Prop({ type: ProjectLightspotAdded, required: false })
	lightspotAdded: ProjectLightspotAdded; // 额外挖掘的亮点

	@Prop({ required: false })
	status: string;

	@Prop({ required: false })
	userInfo: userInfo;
}

export type ProjectMinedDocument = HydratedDocument<ProjectMined>;
export const ProjectMinedSchema = SchemaFactory.createForClass(ProjectMined);
