import type {
	CreateProjectDeepWikiKnowledgeDto,
	DeepWikiKnowledgeDto,
	PersistentTaskVo,
	ServerDataFormat as SDF
} from '@prisma-ai/shared';
import { instance } from '../config';

/**
 * 下载DeepWiki站点为md文件
 * @param dto DeepWiki知识库DTO
 */
export async function downloadDeepWiki(dto: DeepWikiKnowledgeDto) {
	const res = await instance.post<DeepWikiKnowledgeDto, SDF<{ id: string }>>(
		'/knowledge-base/download-deepwiki',
		dto
	);
	return res.data;
}

/**
 * 将DeepWiki md文件上传到知识库
 * @param dto 创建项目DeepWiki知识库DTO
 */
export async function uploadDeepWikiToKnowledgeBase(dto: CreateProjectDeepWikiKnowledgeDto) {
	const res = await instance.post<CreateProjectDeepWikiKnowledgeDto, SDF<{ id: string }>>(
		'/knowledge-base/upload-deepwiki',
		dto
	);
	return res.data;
}

/**
 * 获取任务结果
 * @param taskId 任务ID
 */
export async function getDeepWikiTaskResult(taskId: string) {
	const res = await instance.get<SDF<{ task: PersistentTaskVo }>>(`/knowledge-base/task/${taskId}`);
	return res.data;
}
