import { z } from 'zod';
import {
	lookupResultSchema,
	projectLookupedSchema,
	projectMinedSchema,
	projectPolishedSchema,
	projectSchema
} from './project.schema';

export enum ProjectStatus {
	committed = 'committed', //初提交
	lookuped = 'lookuped', //llm分析完毕

	/* 仅在 ProjectPolishedSchema 中*/
	polishing = 'polishing', //llm已打磨

	polished = 'polished', //用户已合并打磨

	/* 仅在 ProjectMinedSchema 中*/
	mining = 'mining', //llm已挖掘

	mined = 'mined', //用户已合并挖掘
	accepted = 'accepted', //完成

	/* 仅在ResumeMatched中 */
	matched = 'matched' //已匹配岗位
}
export type lookupResultDto = z.infer<typeof lookupResultSchema>;
/* 含lookupResult的projectDto */
export type projectLookupedDto = z.infer<typeof projectLookupedSchema>;
export type ProjectDto = z.infer<typeof projectSchema>;
export type ProjectPolishedDto = z.infer<typeof projectPolishedSchema>;
export type ProjectMinedDto = z.infer<typeof projectMinedSchema>;

export interface ProjectVo extends z.infer<typeof projectSchema> {
	id: string; // 数据库中的ID
	name?: string; //项目名称
	status: ProjectStatus; //项目状态

	createdAt: string;
	updatedAt: string;

	//分析结果
	lookupResult?: z.infer<typeof lookupResultSchema>;
}

export interface ProjectPolishedVo extends z.infer<typeof projectPolishedSchema> {
	reasonContent?: string; // 推理内容
}

export interface ProjectMineddVo extends z.infer<typeof projectMinedSchema> {
	reasonContent?: string; // 推理内容
}

/**
 * 亮点实现前端上传的Dto
 */
export interface ImplementDto {
	projectId: string;
	lightspot: string;
	projectPath: string;
}
