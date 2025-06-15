/**
 * 人岗匹配前端上传的 DTO
 */
export interface HjmMatchDto {
	resumeId: string; // 简历的id
	topK?: number; // 召回数量，默认为20
	rerankTopN?: number; // 最终返回的重排后岗位数量，默认为5
}
