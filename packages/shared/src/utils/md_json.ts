import { z } from 'zod';
import { projectSchemaForm } from '../types/project/project.schema-form';
import { type CreateSkillDto, type SkillItem } from '../types/skill';
/**
 * 将项目的Markdown格式文本转换为符合projectSchemaForm的结构化数据
 * @param markdown 项目的Markdown格式文本
 * @returns 符合projectSchemaForm的结构化数据
 */
export function markdownToProjectSchema(markdown: string): z.infer<typeof projectSchemaForm> {
	// 初始化结果对象
	const result: z.infer<typeof projectSchemaForm> = {
		name: '',
		info: {
			name: '',
			desc: {
				role: '',
				contribute: '',
				bgAndTarget: ''
			},
			techStack: []
		},
		lightspot: {
			team: [],
			skill: [],
			user: []
		}
	};
	//移除所有注释和空行
	markdown = markdown.replace('<br />', '').replace(/^\s*>\s*(.+?)$/gm, '');

	// 处理项目名称
	const nameMatch = markdown.match(/名称：(.+?)(?:\n|$)/);
	if (nameMatch && nameMatch[1]) {
		result.info.name = nameMatch[1].trim();
	}

	// 处理角色和职责
	const roleMatch = markdown.match(/角色与职责：(.+?)(?:\n|$)/);
	if (roleMatch && roleMatch[1]) {
		result.info.desc.role = roleMatch[1].trim();
	}

	// 处理核心贡献
	const contributeMatch = markdown.match(/核心贡献与参与程度：(.+?)(?:\n|$)/);
	if (contributeMatch && contributeMatch[1]) {
		result.info.desc.contribute = contributeMatch[1].trim();
	}

	// 处理项目背景和目的
	const bgMatch = markdown.match(/背景与目的：(.+?)(?:\n|$)/);
	if (bgMatch && bgMatch[1]) {
		result.info.desc.bgAndTarget = bgMatch[1].trim();
	}
	// 处理技术栈
	const techStackSection = markdown.match(/#### 1\.3 项目技术栈\s*?\n([\s\S]*?)(?=\n###|$)/);
	console.log('markdownToProjectSchema ~ techStackSection:', techStackSection);
	if (techStackSection && techStackSection[1]) {
		const techStackText = techStackSection[1].trim();
		// 将逗号、顿号分隔的技术栈转为数组
		result.info.techStack = techStackText.split(/[、,，\s]+/).filter(Boolean);
	}

	// 处理团队贡献亮点
	const teamSection = markdown.match(/#### 2\.1 团队贡献\s*([\s\S]*?)(?=\n####|$)/);
	if (teamSection && teamSection[1]) {
		//! crepe编辑器中无序列表项 - 会转为 *: 统一用*,且会跟<br />
		// 提取所有以 "*" 或 " * " 开头的行
		const teamPoints = teamSection[1].match(/^\s*\*\s*(.+?)$/gm);
		if (teamPoints) {
			result.lightspot.team = teamPoints.map(point =>
				point
					.replace('<br />', '')
					.replace(/^\s*\*\s*/, '')
					.trim()
			);
		}
	}

	// 处理技术亮点/难点
	const skillSection = markdown.match(/#### 2\.2 技术亮点\/难点\s*([\s\S]*?)(?=\n####|$)/);
	if (skillSection && skillSection[1]) {
		const skillPoints = skillSection[1].match(/^\s*\*\s*(.+?)$/gm);
		if (skillPoints) {
			result.lightspot.skill = skillPoints.map(point =>
				point
					.replace('<br />', '')
					.replace(/^\s*\*\s*/, '')
					.trim()
			);
		}
	}

	// 处理用户体验/业务价值
	const userSection = markdown.match(/#### 2\.3 用户体验\/业务价值\s*([\s\S]*?)(?=\n####|$)/);
	if (userSection && userSection[1]) {
		const userPoints = userSection[1].match(/^\s*\*\s*(.+?)$/gm);
		if (userPoints) {
			result.lightspot.user = userPoints.map(point =>
				point
					.replace('<br />', '')
					.replace(/^\s*\*\s*/, '')
					.trim()
			);
		}
	}

	return result;
}

/**
 * 将项目schema对象转换回Markdown格式
 * @param project 项目结构化数据
 * @returns Markdown格式文本
 */
export function projectSchemaToMarkdown(project: z.infer<typeof projectSchemaForm>): string {
	let markdown = `### 1、项目信息\n\n`;

	// 基本信息
	markdown += `#### 1.1 基本信息\n\n`;
	markdown += `* 名称：${project.info.name}\n\n`;

	// 项目介绍
	markdown += `#### 1.2 项目介绍\n\n`;
	markdown += `* 角色与职责：${project.info.desc.role}\n`;
	markdown += `* 核心贡献与参与程度：${project.info.desc.contribute}\n`;
	markdown += `* 背景与目的：${project.info.desc.bgAndTarget}\n\n`;

	// 技术栈
	markdown += `#### 1.3 项目技术栈\n\n`;
	markdown += `${project.info.techStack.join('、')}\n\n`;

	// 亮点
	markdown += `### 2、亮点\n\n`;

	// 团队贡献
	markdown += `#### 2.1 团队贡献\n`;
	project.lightspot.team.forEach(item => {
		markdown += `  * ${item}\n`;
	});

	// 技术亮点
	markdown += `#### 2.2 技术亮点/难点\n`;
	project.lightspot.skill.forEach(item => {
		markdown += `  * ${item}\n`;
	});

	// 用户体验
	markdown += `#### 2.3 用户体验/业务价值\n`;
	project.lightspot.user.forEach(item => {
		markdown += `  * ${item}\n`;
	});

	return markdown;
}

// 将技能数据转换为 Markdown
export const skillsToMarkdown = (data: CreateSkillDto): string => {
	let markdown = '## 职业技能\n\n';

	data?.content?.forEach(skillGroup => {
		if (skillGroup.type) {
			markdown += `* ${skillGroup.type}:`;
			if (skillGroup.content && skillGroup.content.length > 0) {
				markdown += ` ${skillGroup.content.join('、')}\n`;
			} else {
				markdown += '\n';
			}
		}
	});

	return markdown;
};

// 将 Markdown 转换为技能数据
export const markdownToSkills = (markdown: string): CreateSkillDto => {
	const content: SkillItem[] = [];

	//移除所有注释和空行
	markdown = markdown.replace('<br />', '').replace(/^\s*>\s*(.+?)$/gm, '');

	// 使用正则表达式匹配所有技能块，从 *或者- 开始到下一个 *或者- 或字符串结尾
	const skillBlockRegex = /[*-]\s*([^-*]+?)(?=\*|$)/gs;
	const matches = markdown.matchAll(skillBlockRegex);

	for (const match of matches) {
		const blockContent = match[1];
		if (!blockContent) continue;

		// 移除所有换行符
		const cleanedContent = blockContent.replace(/\n+/g, '').trim();

		const colonMatch = cleanedContent.match(/^([^:：]+)[：:](.*)$/);

		if (colonMatch) {
			const type = colonMatch[1].trim();
			const skillsString = colonMatch[2].trim();

			if (type) {
				// 解析技能列表，支持多种分隔符
				const skills = skillsString
					? skillsString
							.split(/[、，,]/)
							.map(skill => skill.trim())
							.filter(skill => skill.length > 0)
					: [];

				content.push({
					type,
					content: skills
				});
			}
		}
	}

	// 如果没有解析到任何内容，返回默认结构
	if (content.length === 0) {
		return {
			name: '',
			content: [
				{ type: '前端', content: [] },
				{ type: '后端', content: [] },
				{ type: '数据库', content: [] }
			]
		};
	}

	return { name: '', content };
};
