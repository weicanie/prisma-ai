import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { userInfo } from './project.entity';

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

	@Prop({ required: true })
	userInfo: userInfo; // 用户信息

	@Prop({ required: true })
	projectName: string;
}

export type LookupResultDocument = HydratedDocument<LookupResult>;
export const LookupResultSchema = SchemaFactory.createForClass(LookupResult);
