import * as fs from 'fs';
import * as path from 'path';

/**
 * 确保路径存在
 * @param targetPath 路径，指向文件或目录
 */
export function pathExist(targetPath: string): void {
	try {
		// 检查路径是否已存在
		if (fs.existsSync(targetPath)) {
			return;
		}

		// 判断是文件路径还是目录路径
		// 如果路径有扩展名，则认为是文件路径，需要创建其父目录
		// 如果没有扩展名，则认为是目录路径，直接创建目录
		const extname = path.extname(targetPath);

		if (extname) {
			// 文件路径：创建父目录
			const dirPath = path.dirname(targetPath);
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true });
			}
		} else {
			// 目录路径：直接创建目录
			fs.mkdirSync(targetPath, { recursive: true });
		}
	} catch (error) {
		throw new Error(`创建路径失败: ${targetPath}, 错误: ${error.message}`);
	}
}
