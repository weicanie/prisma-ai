import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProjectInfo } from './project.entities';

@Schema()
export class LightspotFixed {
	@Prop({ required: true })
	content: string;

	@Prop({ required: false })
	advice?: string;
}

@Schema()
export class LightspotDeprecated {
	@Prop({ required: true })
	content: string;

	@Prop({ required: false })
	reason?: string;
}

@Schema()
export class ProjectLightspotPolished {
	@Prop({ type: [LightspotFixed], required: false })
	team: LightspotFixed[]; // 团队贡献

	@Prop({ type: [LightspotFixed], required: false })
	skill: LightspotFixed[]; // 技术亮点/难点

	@Prop({ type: [LightspotFixed], required: false })
	user: LightspotFixed[]; // 用户体验

	@Prop({ type: [LightspotDeprecated], required: false })
	deprecated: LightspotDeprecated[];
}

@Schema()
export class ProjectPolished {
	@Prop({ type: ProjectInfo, required: false })
	info: ProjectInfo; // 项目信息

	@Prop({ type: ProjectLightspotPolished, required: false })
	lightspot: ProjectLightspotPolished; // 项目亮点
}

export type ProjectPolishedDocument = HydratedDocument<ProjectPolished>;

export const ProjectPolishedSchema = SchemaFactory.createForClass(ProjectPolished);
