import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProjectInfo, ProjectLightspot } from './project.entities';

@Schema()
export class LightspotAdded {
	@Prop({ required: true })
	content: string;

	@Prop({ required: true })
	reason: string;

	@Prop({ type: [String], required: true })
	tech: string[];
}

@Schema()
export class ProjectLightspotAdded {
	@Prop({ type: [LightspotAdded], required: false })
	team: LightspotAdded[]; // 团队贡献

	@Prop({ type: [LightspotAdded], required: false })
	skill: LightspotAdded[]; // 技术亮点/难点

	@Prop({ type: [LightspotAdded], required: false })
	user: LightspotAdded[]; // 用户体验
}

@Schema()
export class ProjectMined {
	@Prop({ type: ProjectInfo, required: false })
	info: ProjectInfo; // 项目信息

	@Prop({ type: ProjectLightspot, required: false })
	lightspot: ProjectLightspot; // 项目亮点

	@Prop({ type: ProjectLightspotAdded, required: false })
	lightspotAdded: ProjectLightspotAdded; // 新增项目亮点
}

export type ProjectMinedDocument = HydratedDocument<ProjectMined>;

export const ProjectMinedSchema = SchemaFactory.createForClass(ProjectMined);
