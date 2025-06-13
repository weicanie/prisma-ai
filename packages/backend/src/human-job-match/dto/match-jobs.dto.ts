import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * @description 启动人岗匹配任务的请求体
 */
export class MatchJobsDto {
	/**
	 * 目标简历的ID
	 * @example "6669c5851493190e8894236a"
	 */
	@IsString()
	@IsNotEmpty()
	resumeId: string;

	/**
	 * 召回数量，默认为20
	 * @example 20
	 */
	@IsNumber()
	@IsOptional()
	topK?: number;

	/**
	 * 最终返回的排序后岗位数量，默认为5
	 * @example 5
	 */
	@IsNumber()
	@IsOptional()
	rerankTopN?: number;
}
