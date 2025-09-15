import type {
	CreateSkillDto,
	ServerDataFormat as SDF,
	SkillVo,
	UpdateSkillDto
} from '@prisma-ai/shared';
import { instance } from './config';

/**
 * 创建新的技能
 * @param skillData 创建技能所需的数据
 * @returns 返回创建的技能数据
 */
export async function createSkill(skillData: CreateSkillDto) {
	const res = await instance.post<CreateSkillDto, SDF<SkillVo>>('/skill', skillData);
	return res.data;
}

/**
 * 获取当前用户的所有技能
 * @returns 返回技能列表数据
 */
export async function findAllUserSkills() {
	const res = await instance.get<SDF<SkillVo[]>>('/skill');
	return res.data;
}

/**
 * 获取当前用户指定ID的技能
 * @param id 技能ID
 * @returns 返回指定的技能数据
 */
export async function findOneUserSkill(id: string) {
	const res = await instance.get<SDF<SkillVo>>(`/skill/${id}`);
	return res.data;
}

/**
 * 更新指定ID的技能
 * @param id 技能ID
 * @param skillUpdateData 更新技能所需的数据
 * @returns 返回更新后的技能数据
 */
export async function updateSkill({
	id,
	skillUpdateData
}: {
	id: string;
	skillUpdateData: UpdateSkillDto;
}) {
	const res = await instance.patch<UpdateSkillDto, SDF<SkillVo>>(`/skill/${id}`, skillUpdateData);
	return res.data;
}

/**
 * 删除指定ID的技能
 * @param id 技能ID
 * @returns 返回操作结果
 */
export async function removeSkill(id: string) {
	const res = await instance.delete<SDF<null>>(`/skill/${id}`);
	return res.data;
}
