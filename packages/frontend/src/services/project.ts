import { type ProjectSchemaType } from '../types/project.schema';
import { instance } from './config';
import type { ServerDataFormat as SDF } from './config/types';

async function uploadProject(project: ProjectSchemaType) {
	return await instance.post<ProjectSchemaType, SDF<ProjectSchemaType>>('/project/upload', project);
}

async function getProject() {
	return await instance.get<SDF<ProjectSchemaType>>('/project');
}

export { getProject, uploadProject };
