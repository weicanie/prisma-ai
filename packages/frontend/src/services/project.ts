import {
	type ProjectMinedSchemaT,
	type ProjectPolishedSchemaT,
	type ProjectSchemaT
} from '../types/project.schema';
import { instance } from './config';
import type { ServerDataFormat as SDF } from './config/types';

async function uploadProjectRaw(project: ProjectSchemaT) {
	return await instance.post<ProjectSchemaT, SDF<ProjectSchemaT>>('/project/raw', project);
}

async function uploadProjectPolished(project: ProjectPolishedSchemaT) {
	return await instance.post<ProjectPolishedSchemaT, SDF<ProjectPolishedSchemaT>>(
		'/project/polished',
		project
	);
}

async function uploadProjectMined(project: ProjectMinedSchemaT) {
	return await instance.post<ProjectMinedSchemaT, SDF<ProjectMinedSchemaT>>(
		'/project/mined',
		project
	);
}

async function uploadProjectText(project: string) {
	return await instance.post<string, SDF<ProjectSchemaT>>('/project/rawtext', project);
}

async function queryProject(query: string) {
	return await instance.post<string, SDF<any>>('/project/query', query);
}

export {
	queryProject,
	uploadProjectMined,
	uploadProjectPolished,
	uploadProjectRaw,
	uploadProjectText
};
