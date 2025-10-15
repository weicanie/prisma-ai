import fs from 'fs';
import * as path from 'path';

interface EducationTemplate {
	id: string;
	school: string;
	major: string;
	degree: string;
	startDate: string;
	endDate: string;
	visible: boolean;
	gpa: string;
	description: string;
}

interface ExperienceTemplate {
	id: string;
	company: string;
	position: string;
	date: string;
	visible: boolean;
	details: string;
}

interface ProjectTemplate {
	id: string;
	name: string;
	role: string;
	date: string;
	visible: boolean;
	description: string;
}
/**
 * magic-resume要求的JSON格式
 */
interface ResumeTemplate {
	name: string;
	skillContent: string;
	education: EducationTemplate[];
	experience: ExperienceTemplate[];
	projects: ProjectTemplate[];
}

export const resumeTemplate: ResumeTemplate = JSON.parse(
	fs.readFileSync(path.join(process.cwd(), 'data', 'resume_template.json'), 'utf-8')
);

export enum ActionType {
	GET = 'get',
	SYNC = 'sync',
	DELETE = 'delete'
}
