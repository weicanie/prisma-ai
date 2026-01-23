import type { ServerDataFormat as SDF } from '@prisma-ai/shared';
import { instance } from '../config';

/**
 * 检查项目代码是否上传了
 * @param projectPathName 项目在用户目录中的文件夹名称
 * @returns 是否上传
 */
export async function getHasProjectCodeUpload(projectPathName: string) {
	const res = await instance.get<SDF<boolean>>(
		`/knowledge-base/has_project_code_upload/${projectPathName}`
	);
	return res.data;
}
