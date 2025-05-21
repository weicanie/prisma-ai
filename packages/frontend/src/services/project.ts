import type {
	ProjectExperience,
	ProjectExperienceMined,
	ProjectExperiencePolished,
	ServerDataFormat as SDF
} from '@prism-ai/shared';
import { instance } from './config';

async function uploadProjectRaw(project: ProjectExperience) {
	const res = await instance.post<ProjectExperience, SDF<ProjectExperience>>(
		'/project/raw',
		project
	);
	return res.data;
}

async function uploadProjectPolished(project: ProjectExperiencePolished) {
	const res = await instance.post<ProjectExperiencePolished, SDF<ProjectExperiencePolished>>(
		'/project/polished',
		project
	);
	return res.data;
}

async function uploadProjectMined(project: ProjectExperienceMined) {
	const res = await instance.post<ProjectExperienceMined, SDF<ProjectExperienceMined>>(
		'/project/mined',
		project
	);
	return res.data;
}

async function uploadProjectText(project: string) {
	const res = await instance.post<string, SDF<ProjectExperience>>('/project/rawtext', project);
	return res.data;
}

async function queryProject(query: string) {
	const res = await instance.post<string, SDF<any>>('/project/query', query);
	return res.data;
}

export {
	queryProject,
	uploadProjectMined,
	uploadProjectPolished,
	uploadProjectRaw,
	uploadProjectText
};
