import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument } from 'mongoose';
import { ProjectInfo, userInfo } from './project.entity';

@Schema()
export class LightspotFixed {
	@Prop({ required: true })
	content: string;

	@Prop()
	advice?: string;
}

@Schema()
export class LightspotDeprecated {
	@Prop({ required: true })
	content: string;

	@Prop({ required: true })
	reason: string;
}

@Schema()
export class ProjectLightspotPolished {
	@Prop({ type: [LightspotFixed] })
	team?: LightspotFixed[]; // 团队贡献

	@Prop({ type: [LightspotFixed] })
	skill?: LightspotFixed[]; // 技术亮点/难点

	@Prop({ type: [LightspotFixed] })
	user?: LightspotFixed[]; // 用户体验/业务价值

	@Prop({ type: [LightspotDeprecated] })
	deprecated?: LightspotDeprecated[];
}

@Schema({ timestamps: true })
export class ProjectPolished {
	@Prop({ type: ProjectInfo, required: true })
	info: ProjectInfo; // 复用ProjectInfo

	@Prop({ type: ProjectLightspotPolished, required: true })
	lightspot: ProjectLightspotPolished;

	@Prop({ required: true })
	status: 'polishing'; //llm已打磨

	@Prop({ required: true })
	userInfo: userInfo;
}

export type ProjectPolishedDocument = HydratedDocument<ProjectPolished>;
export const ProjectPolishedSchema = SchemaFactory.createForClass(ProjectPolished);

ProjectPolishedSchema.index({ 'userInfo.userId': 1, status: 1 });

ProjectPolishedSchema.pre('save', async function (this: ProjectPolishedDocument) {
	if (this.status !== 'polishing') {
		throw new Error('项目状态必须为 polishing');
	}
});

ProjectPolishedSchema.post('save', async function (this: ProjectPolishedDocument) {
	console.log('mongodb:polishing项目经验保存:', this.info.name);
});
