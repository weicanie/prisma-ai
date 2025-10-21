import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProjectInfo, ProjectLightspot, UserInfo } from './project.entity';

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
	@Prop({ type: [LightspotAdded] })
	team?: LightspotAdded[]; // 团队贡献

	@Prop({ type: [LightspotAdded] })
	skill?: LightspotAdded[]; // 技术亮点/难点

	@Prop({ type: [LightspotAdded] })
	user?: LightspotAdded[]; // 用户体验/业务价值
}

@Schema({ timestamps: true })
export class ProjectMined {
	// 名称，用于标识项目数据，关联知识库、代码库
	// 必须与github仓库名称一致（用于关联代码库）
	@Prop({ required: true })
	name: string;

	@Prop({ type: ProjectInfo, required: true })
	info: ProjectInfo; // 复用ProjectInfo

	@Prop({ type: ProjectLightspot, required: true })
	lightspot: ProjectLightspot; // 原始亮点

	@Prop({ type: ProjectLightspotAdded })
	lightspotAdded?: ProjectLightspotAdded; // 额外挖掘的亮点

	@Prop({ required: true })
	status: 'mining'; //llm已挖掘

	@Prop({ required: true })
	userInfo: UserInfo;

	@Prop({ type: String })
	reasonContent?: string; // 推理内容
}

export type ProjectMinedDocument = HydratedDocument<ProjectMined> & {
	id: string;
	createdAt: string;
	updatedAt: string;
};
export const ProjectMinedSchema = SchemaFactory.createForClass(ProjectMined);

ProjectMinedSchema.index({ 'userInfo.userId': 1, status: 1 });

ProjectMinedSchema.pre('save', function (this: ProjectMinedDocument) {
	if (this.status !== 'mining') {
		throw new Error('项目状态必须为 mining');
	}
});

ProjectMinedSchema.post('save', function (this: ProjectMinedDocument) {
	console.log('mongodb:mining项目经验保存:', this.info.name);
});
