import fs from 'fs';
import path from 'path';
import { baseUserUseDataDir } from './constants';
interface UserUseData {
	feedback: any;
	context: any;
	timestamp: string;
}
/**
 * 用户使用数据记录
 * 用于记录用户的反馈及其上下文，作为json对象写入文件中的数组
 */
export function recordUserUseData(feedback: any, context: any) {
	try {
		// 读取文件内容
		const filePath = path.join(baseUserUseDataDir, 'feedback_ai', `data.json`);
		let data: UserUseData[] = [];
		if (fs.existsSync(filePath)) {
			const fileContent = fs.readFileSync(filePath, 'utf8');
			data = JSON.parse(fileContent);
		} else {
			fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
		}
		// 添加新记录
		data.push({
			feedback,
			context,
			timestamp: new Date().toISOString()
		});
		// 写入文件
		fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
	} catch (error) {
		console.error('记录用户使用数据失败:', error);
	}
}
