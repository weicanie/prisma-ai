import { spawn } from 'child_process';
import * as path from 'path';
/**
 * 执行一个 shell 脚本文件。
 * @param scriptPath - .sh 脚本的绝对路径。
 * @param args - 传递给脚本的参数列表 (e.g., ['arg1', 'arg2'])。
 * @returns 返回一个 Promise，它在脚本成功执行时解析，在失败时拒绝。
 */
export function executeShellScript(scriptPath: string, args: string[]): Promise<void> {
	console.log(`准备执行脚本: ${scriptPath}，参数: ${args.join(' ')}`);

	return new Promise((resolve, reject) => {
		// 开启一个子进程，使用 'bash' 来解释执行 .sh 脚本
		const process = spawn('bash', [scriptPath, ...args]);

		// 监听并打印标准输出流
		process.stdout.on('data', data => {
			console.log(`[stdout]: ${data.toString().trim()}`);
		});

		// 监听并打印标准错误流
		process.stderr.on('data', data => {
			// stderr 不一定总是代表错误，git clone 就会在 stderr 中打印进度信息
			console.error(`[stderr]: ${data.toString().trim()}`);
		});

		// 监听进程退出事件
		process.on('close', code => {
			if (code === 0) {
				console.log(`脚本 ${path.basename(scriptPath)} 成功执行完毕。`);
				resolve();
			} else {
				const error = new Error(`脚本执行失败，退出码: ${code}`);
				console.error(error);
				reject(error);
			}
		});

		// 监听子进程启动错误，例如找不到 'bash' 命令
		process.on('error', err => {
			console.error('启动子进程失败', err);
			reject(err);
		});
	});
}

async function main() {
	try {
		// 脚本的相对路径
		const scriptRelativePath = '../../../scripts/clone_repo.sh';
		// 获取脚本的绝对路径
		const scriptAbsolutePath = path.resolve(__dirname, scriptRelativePath);

		// 准备参数
		const repoUrl = 'https://github.com/nestjs/nest.git'; // 示例仓库
		// 克隆到项目根目录下的 'projects/nest-example' 文件夹
		const destinationPath = path.resolve(__dirname, '../../../..', 'projects', 'nest-example');

		console.log('--- 开始执行克隆脚本 ---');
		await executeShellScript(scriptAbsolutePath, [repoUrl, destinationPath]);
		console.log('--- 克隆脚本执行完毕 ---');
	} catch (error) {
		console.error('在执行脚本过程中发生错误:', error);
	}
}

// 如果直接运行这个文件，则执行main函数
if (require.main === module) {
	main();
}
