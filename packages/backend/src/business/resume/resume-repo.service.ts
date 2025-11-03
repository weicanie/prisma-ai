import { Injectable } from '@nestjs/common';
import {
	projectSchemaToMarkdown,
	ResumeStatus,
	ResumeVo,
	skillsToMarkdown,
	UserInfoFromToken
} from '@prisma-ai/shared';
import fs from 'fs';
import lodash from 'lodash';
import path from 'path';
import { user_data_dir } from '../../utils/constants';
import { ActionType, resumeTemplate } from '../../utils/resume/constant';
import { serverResumefileManager } from '../../utils/resume/resumeRepositoryManager';
import { ResumeRepoDto } from './dto/resumeRepo.dto';
import { ResumeDocument } from './entities/resume.entity';
import { ResumeService } from './resume.service';

/**
 * 将简历数据导出为magic-resume要求的JSON格式，并通过写入到指定文件夹来进行共享。
 */
@Injectable()
export class ResumeJsonService {
	constructor(private readonly resumeService: ResumeService) {}

	async exportResume(resumeId: string, userInfo: UserInfoFromToken) {
		try {
			let resume: ResumeVo;
			// 先尝试根据简历ID查询普通简历，若不存在则查询岗位定制简历
			try {
				resume = await this.resumeService.findOne(resumeId, userInfo);
			} catch (error) {
				resume = await this.resumeService.findOneResumeMatched(resumeId, userInfo);
			}
			let resumeJson: any = (resume as unknown as ResumeDocument).toJSON();
			resumeJson = await this.fillTemplate(resumeJson);

			const resumeJsonPath = path.join(
				user_data_dir.resumesDirPath(userInfo.userId),
				`${resumeId}.json`
			);
			fs.writeFileSync(resumeJsonPath, JSON.stringify(resumeJson, null, 2));
			return '简历导入编辑器成功';
		} catch (error) {
			throw new Error('简历导入编辑器失败:' + error.message);
		}
	}

	/**
	 * 根据简历数据填充简历模板
	 */
	private async fillTemplate(resumeVo: ResumeVo) {
		// 动态导入 marked 库以兼容 CommonJS 环境
		const { marked } = await import('marked');
		
		const template = lodash.cloneDeep(resumeTemplate);

		const skillContent = marked(skillsToMarkdown(resumeVo.skill), { async: false });
		const projectTemplates = resumeVo.projects?.map(project => {
			return {
				id: project.id,
				name: project.info.name,
				role: project.info.desc.role.slice(0, 10) + '...',
				date: template.projects[0].date,
				visible: true,
				description: marked(projectSchemaToMarkdown(project), { async: false })
			};
		});
		const educationTemplates = resumeVo.educations?.map(education => ({
			id: education.id,
			school: education.school,
			major: education.major,
			degree: education.degree,
			startDate: education.startDate,
			endDate: education.endDate || '',
			visible: true,
			gpa: education.gpa || '',
			description: marked(education.description || '', { async: false })
		}));
		const experienceTemplates = resumeVo.careers?.map(career => ({
			id: career.id,
			company: career.company,
			position: career.position,
			date: `${career.startDate} - ${career.endDate || '至今'}`,
			visible: true,
			details: marked(career.details || '', { async: false })
		}));

		template.name = `${resumeVo.name}-${resumeVo.status === ResumeStatus.committed ? '通用简历' : '岗位定制简历'}`;
		template.title = template.name;
		template.skillContent = skillContent ?? template.skillContent;
		template.projects = projectTemplates ?? template.projects;
		template.education = educationTemplates ?? template.education;
		template.experience = experienceTemplates ?? template.experience;
		template.id = resumeVo.id;

		return template;
	}

	async handleRepoAction(repoDto: ResumeRepoDto, userInfo: UserInfoFromToken) {
		switch (repoDto.actionType) {
			case ActionType.GET:
				return serverResumefileManager.getResumeFromRepository(userInfo);
			case ActionType.SYNC:
				return serverResumefileManager.syncResumeToRepository(
					repoDto.payload.resumeData,
					userInfo,
					repoDto.payload.prevResume
				);
			case ActionType.DELETE:
				return serverResumefileManager.deleteResumeFromRepository(
					repoDto.payload.resumeData,
					userInfo
				);
		}
	}
}
