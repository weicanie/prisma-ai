/**
 * @description 将基于 MECE 的候选人画像JSON（userProfileSchema 等价于 candidateProfileSchema）
 * 转换为便于阅读的叙述文本。
 *
 * 设计目标：
 * - 简洁：仅输出非空要点；自动忽略空字段
 * - 结构：按「资历背景 / 能力模型 / 职责范围」分段叙述
 * - 语义：将关键词数组转为自然语言短句，
 */

import { UserProfileT } from '../types/user_memory';

/**
 * 将关键词数组转为中文逗号分隔的短语串
 */
function joinPhrases(phrases: string[] | undefined): string {
	if (!phrases || phrases.length === 0) return '';
	// 去重 + 过滤空串
	const unique = Array.from(new Set(phrases.map(s => s.trim()).filter(Boolean)));
	return unique.join('、');
}

/**
 * 将一个段落的多行要点合并为自然段
 */
function combineLines(lines: string[]): string {
	const nonEmpty = lines.map(s => s.trim()).filter(Boolean);
	return nonEmpty.length > 0 ? nonEmpty.join('；') + '。' : '';
}

/**
 * 将字符串数组转为列举行，如["前端","后端"] -> `前端`、`后端`
 */
export function stringArrayToline(list: string[]) {
	let itemLine = list.reduce((acc, curr) => acc + `\`${curr}\`` + '、', '');
	itemLine = itemLine.slice(0, itemLine.length - 1); //去掉末尾多余的`、`
	return itemLine;
}

/**
 * 将用户画像json转为文本
 *
 * @param profile 候选人画像（userProfileSchema 等价于 candidateProfileSchema）
 * @param markdown 是否以markdown格式返回
 * @returns 中文叙述文本
 */
export function profileJsonToText(profile: UserProfileT, markdown = false): string {
	// 安全防御：若对象缺失，返回空
	if (!profile) return '';

	const { qualifications, skills_matrix, responsibilities } = profile;

	// 一、资历背景（Qualifications）
	const q_lines: string[] = [];
	const exp = joinPhrases(qualifications?.experience_level);
	if (exp) q_lines.push(`经验层级：${exp}`);
	const degree = joinPhrases(qualifications?.education_degree);
	if (degree) q_lines.push(`学历背景：${degree}`);
	const majors = joinPhrases(qualifications?.education_majors);
	if (majors) q_lines.push(`相关专业：${majors}`);
	const languages = joinPhrases(qualifications?.language_proficiencies);
	if (languages) q_lines.push(`语言能力：${languages}`);
	const certs = joinPhrases(qualifications?.certifications);
	if (certs) q_lines.push(`资格认证：${certs}`);
	const q_text = combineLines(q_lines);

	// 二、能力模型（Skills Matrix）
	const s_lines: string[] = [];
	const domains = joinPhrases(skills_matrix?.domain_knowledge);
	if (domains) s_lines.push(`行业/领域：${domains}`);
	const langs = joinPhrases(skills_matrix?.programming_languages);
	if (langs) s_lines.push(`编程语言：${langs}`);
	const frameworks = joinPhrases(skills_matrix?.frameworks_and_libraries);
	if (frameworks) s_lines.push(`框架/库：${frameworks}`);
	const tools = joinPhrases(skills_matrix?.tools_and_platforms);
	if (tools) s_lines.push(`工具/平台：${tools}`);
	const soft = joinPhrases(skills_matrix?.soft_skills);
	if (soft) s_lines.push(`软技能：${soft}`);
	const s_text = combineLines(s_lines);

	// 三、职责范围（Responsibilities）
	const r_lines: string[] = [];
	const duties = joinPhrases(responsibilities?.primary_duties);
	if (duties) r_lines.push(`核心职责：${duties}`);
	const methods = joinPhrases(responsibilities?.work_methodologies);
	if (methods) r_lines.push(`工作方法：${methods}`);
	const scope = joinPhrases(responsibilities?.scope_and_impact);
	if (scope) r_lines.push(`范围与影响：${scope}`);
	const r_text = combineLines(r_lines);

	if (!markdown) {
		const sections: string[] = [];
		if (q_text) sections.push(`一、资历背景：${q_text}`);
		if (s_text) sections.push(`二、能力模型：${s_text}`);
		if (r_text) sections.push(`三、职责范围：${r_text}`);
		return sections.join('\n');
	}

	// markdown 模式：将 json 层级转为标题层级，string[] 转为无序列表
	const mdLines: string[] = [];

	// 渲染一个字段（数组 -> 无序列表）
	const renderList = (title: string, items?: string[]) => {
		const list = (items ?? []).map(s => s.trim()).filter(Boolean);
		if (list.length === 0) return;
		mdLines.push(`#### ${title}`);
		// for (const it of list) {
		// 	mdLines.push(`- ${it}`);
		// }
		mdLines.push(stringArrayToline(list));
		mdLines.push('');
	};

	// 资历背景
	if (
		(qualifications?.experience_level?.length ?? 0) > 0 ||
		(qualifications?.education_degree?.length ?? 0) > 0 ||
		(qualifications?.education_majors?.length ?? 0) > 0 ||
		(qualifications?.language_proficiencies?.length ?? 0) > 0 ||
		(qualifications?.certifications?.length ?? 0) > 0
	) {
		mdLines.push(`### 一、资历背景`);
		renderList('经验层级', qualifications?.experience_level);
		renderList('学历背景', qualifications?.education_degree);
		renderList('相关专业', qualifications?.education_majors);
		renderList('语言能力', qualifications?.language_proficiencies);
		renderList('资格认证', qualifications?.certifications);
	}

	// 能力模型
	if (
		(skills_matrix?.domain_knowledge?.length ?? 0) > 0 ||
		(skills_matrix?.programming_languages?.length ?? 0) > 0 ||
		(skills_matrix?.frameworks_and_libraries?.length ?? 0) > 0 ||
		(skills_matrix?.tools_and_platforms?.length ?? 0) > 0 ||
		(skills_matrix?.soft_skills?.length ?? 0) > 0
	) {
		mdLines.push(`### 二、能力模型`);
		renderList('行业/领域', skills_matrix?.domain_knowledge);
		renderList('编程语言', skills_matrix?.programming_languages);
		renderList('框架/库', skills_matrix?.frameworks_and_libraries);
		renderList('工具/平台', skills_matrix?.tools_and_platforms);
		renderList('软技能', skills_matrix?.soft_skills);
	}

	// 职责范围
	if (
		(responsibilities?.primary_duties?.length ?? 0) > 0 ||
		(responsibilities?.work_methodologies?.length ?? 0) > 0 ||
		(responsibilities?.scope_and_impact?.length ?? 0) > 0
	) {
		mdLines.push(`### 三、职责范围`);
		renderList('核心职责', responsibilities?.primary_duties);
		renderList('工作方法', responsibilities?.work_methodologies);
		renderList('范围与影响', responsibilities?.scope_and_impact);
	}

	return mdLines.join('\n');
}
