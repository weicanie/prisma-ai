import { z } from 'zod';
import {
	lookupResultSchema,
	projectMinedSchema,
	projectPolishedSchema,
	projectSchema
} from './project.schema';

export enum ProjectStatus {
	refuse = 'refuse', //信息未完整
	committed = 'committed', //信息完整

	/* ProjectPolishedSchema 中只会有此状态的项目描述*/
	polishing = 'polishing', //llm已打磨

	polished = 'polished', //用户已合并打磨

	/* ProjectMinedSchema 中只会有此状态的项目描述*/
	mining = 'mining', //llm已挖掘

	mined = 'mined', //用户已合并挖掘
	accepted = 'accepted' //完成
}

export type ProjectDto = z.infer<typeof projectSchema>;
export type ProjectPolishedDto = z.infer<typeof projectPolishedSchema>;
export type ProjectMinedDto = z.infer<typeof projectMinedSchema>;

export interface ProjectVo extends z.infer<typeof projectSchema> {
	id: string;
	status: ProjectStatus; //项目状态
	createdAt?: string;
	updatedAt?: string;

	//拷打结果
	lookupResult: z.infer<typeof lookupResultSchema>;
}

export interface ProjectPolishedVo extends z.infer<typeof projectPolishedSchema> {}

export interface ProjectMineddVo extends z.infer<typeof projectMinedSchema> {}
