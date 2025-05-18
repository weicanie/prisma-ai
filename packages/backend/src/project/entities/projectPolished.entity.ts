import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EnumValues } from 'zod';
import { UserInfoFromToken } from '../../types/loginVerify';
import { ProjectState } from '../project.service';
import { ProjectInfo } from './project.entity';

@Schema()
export class ProjectLightspotPolishedItem {
	@Prop({ required: true })
	content: string; // 亮点内容

	@Prop({ required: false, default: 'NONE' })
	advice: string; // 亮点改进建议
}

@Schema()
export class ProjectLightspotPolished {
	@Prop({ type: [ProjectLightspotPolishedItem], required: false, default: [] })
	team: ProjectLightspotPolishedItem[]; // 团队贡献

	@Prop({ type: [ProjectLightspotPolishedItem], required: false, default: [] })
	skill: ProjectLightspotPolishedItem[]; // 技术亮点/难点

	@Prop({ type: [ProjectLightspotPolishedItem], required: false, default: [] })
	user: ProjectLightspotPolishedItem[]; // 用户体验
}

@Schema()
export class ProjectPolished {
	@Prop({ type: ProjectInfo, required: false })
	info: ProjectInfo; // 复用ProjectInfo

	@Prop({ type: ProjectLightspotPolished, required: false })
	lightspot: ProjectLightspotPolished; // 注意这里是打磨后的亮点

	@Prop({ required: false })
	status: EnumValues<ProjectState>;

	@Prop({ required: false })
	userInfo: UserInfoFromToken;
}

export type ProjectPolishedDocument = HydratedDocument<ProjectPolished>;
export const ProjectPolishedSchema = SchemaFactory.createForClass(ProjectPolished);
