import {
	projectSchema,
	type ImplementDto,
	type PersistentTaskVo,
	type ProjectDto,
	type ProjectVo,
	type ServerDataFormat as SDF
} from '@prisma-ai/shared';
import { ZodError } from 'zod';
import { instance } from './config';
/**
 * 上传JSON新建项目经验
 * @param project JSON格式的项目经验对象
 * @return 返回创建的项目经验数据
 */
export async function createProject(project: ProjectDto) {
	try {
		projectSchema.parse(project);
	} catch (error) {
		if (error instanceof ZodError) {
			console.error('验证失败:', error);
		}
		return {
			code: '9999',
			message: '项目数据格式错误',
			data: null
		};
	}
	const res = await instance.post<ProjectDto, SDF<ProjectVo>>('/project/add', project);
	return res.data;
}
/**
 * 上传项目经验文本创建项目经验
 * 使用llm改写格式
 * @param projectText 项目经验文本
 */
export async function createFrommText(projectText: string) {
	const res = await instance.post<string, SDF<ProjectVo>>('/project/add-text', projectText);
	return res.data;
}

/**
 * 获取用户的所有项目经验
 */
export async function findAllProjects() {
	const res = await instance.get<SDF<ProjectVo[]>>('/project/all');
	return res.data;
}

/**
 * 获取指定状态的项目经验
 * @param name 项目名称
 * @param status 项目状态
 */
export async function findByNameAndStatus(name: string, status: string) {
	const res = await instance.get<SDF<ProjectVo>>(`/project/one?name=${name}&status=${status}`);
	return res.data;
}

/**
 *
 * @param id 项目ID
 * @description 根据项目ID获取项目经验
 * @returns
 */
export async function findById(id: string) {
	const res = await instance.get<SDF<ProjectVo>>(`/project/${id}`);
	return res.data;
}

/**
 * 更新项目经验
 * @param id 项目ID
 * @param projectUpdateDto 更新的项目信息
 */
export async function updateProject(projectUpdateDto: Partial<ProjectDto> & { id: string }) {
	const res = await instance.put<Partial<ProjectDto>, SDF<ProjectVo>>(
		`/project/${projectUpdateDto.id}`,
		projectUpdateDto
	);
	return res.data;
}

/**
 * 删除项目经验
 * @param id 项目ID
 */
export async function removeProject(id: string) {
	const res = await instance.delete<SDF<null>>(`/project/${id}`);
	return res.data;
}

/**
 * 亮点实现
 * @param implementDto 实现亮点所需的数据
 * @returns 返回实现亮点的任务
 */
export async function implementProject(implementDto: ImplementDto) {
	const res = await instance.post<ImplementDto, SDF<PersistentTaskVo>>(
		'/project/agent-implement',
		implementDto
	);
	return res.data;
}
