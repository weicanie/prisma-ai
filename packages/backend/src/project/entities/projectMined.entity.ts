import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EnumValues } from 'zod';
import { UserInfoFromToken } from '../../types/loginVerify';
import { ProjectState } from '../project.service';
import { ProjectInfo, ProjectLightspot } from './project.entity';

@Schema()
export class ProjectLightspotMinedItem {
	@Prop({ required: true })
	content: string; // 亮点内容

	@Prop({ required: false, default: 'NONE' })
	reason: string; // 亮点添加原因

	@Prop({ type: [String], required: false, default: [] })
	tech: string[]; // 涉及技术
}

@Schema()
export class ProjectLightspotMined {
	@Prop({ type: [ProjectLightspotMinedItem], required: false, default: [] })
	team: ProjectLightspotMinedItem[]; // 团队贡献

	@Prop({ type: [ProjectLightspotMinedItem], required: false, default: [] })
	skill: ProjectLightspotMinedItem[]; // 技术亮点/难点

	@Prop({ type: [ProjectLightspotMinedItem], required: false, default: [] })
	user: ProjectLightspotMinedItem[]; // 用户体验
}

@Schema()
export class ProjectMined {
	@Prop({ type: ProjectInfo, required: false })
	info: ProjectInfo; // 复用ProjectInfo

	@Prop({ type: ProjectLightspot, required: false })
	lightspot: ProjectLightspot; // 原始亮点

	@Prop({ type: ProjectLightspotMined, required: false })
	lightspotAdded: ProjectLightspotMined; // 额外挖掘的亮点

	@Prop({ required: false })
	status: EnumValues<ProjectState>;

	@Prop({ required: false })
	userInfo: UserInfoFromToken;
}

export type ProjectMinedDocument = HydratedDocument<ProjectMined>;
export const ProjectMinedSchema = SchemaFactory.createForClass(ProjectMined);
