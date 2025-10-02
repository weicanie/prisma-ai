import type { ServerDataFormat, UserMemoryT } from '@prisma-ai/shared';
import { instance } from './config';

// 获取用户记忆
export async function getUserMemory() {
	const res = await instance.get<ServerDataFormat<UserMemoryT>>(`/user-memory`);
	return res.data;
}

// 更新用户记忆
export async function updateUserMemory(userMemory: UserMemoryT) {
	const res = await instance.patch<UserMemoryT, ServerDataFormat<unknown>>(
		`/user-memory`,
		userMemory
	);
	return res.data;
}
