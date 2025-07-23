import type { ServerDataFormat } from '@prisma-ai/shared';
import { instance } from '../config';
/**
 * 前端通过后端直传文件到OSS
 * @param files 文件列表
 * @param token
 */
export async function uploadFilesToOSS(files: File[]) {
	for (const file of files) {
		const {
			data: { data: url }
		} = await instance.get<ServerDataFormat<string>>(`/oss/presignedUrl?name=${file.name}`);
		try {
			await instance.put(url, file);
		} catch (error) {
			console.error(error);
		}
	}
}
/**
 * 获取OSS直传URL
 * @param fileName 文件名
 * @param bucketName 桶名
 * @returns
 */
export async function presignedUrl(fileName: string, bucketName = 'prisma-ai') {
	return instance.get<ServerDataFormat<string>>(
		`/oss/presignedUrl?name=${fileName}&bucketName=${bucketName}`
	);
}
