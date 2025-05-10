import { Injectable } from '@nestjs/common';
import * as readline from 'readline/promises';
import { MCPClientService } from './mcp-client.service';

@Injectable()
export class CLIService {
	constructor(private readonly mcpClientService: MCPClientService) {}

	showUsage(): void {
		console.log('=====================================================');
		console.log('MCP Client - 模型上下文协议客户端');
		console.log('=====================================================');
		console.log('基本用法:');
		console.log('  node dist/main.js <服务器脚本路径>');
		console.log('使用配置文件:');
		console.log('  node dist/main.js <服务器名称> <配置文件路径>');
		console.log('示例:');
		console.log('  node dist/main.js ../mcp-server/build/index.js');
		console.log('  node dist/main.js memory ./mcp-servers.json');
		console.log('  node dist/main.js default ./mcp-servers.json');
		console.log('=====================================================');
	}

	async run(): Promise<void> {
		if (process.argv.length < 3) {
			this.showUsage();
			return;
		}

		const serverIdentifier = process.argv[2];
		const configPath = process.argv.length >= 4 ? process.argv[3] : undefined;

		try {
			// 连接到服务器
			if (configPath) {
				console.log(`正在连接到服务器: ${serverIdentifier} (使用配置文件: ${configPath})`);
			} else {
				console.log(`正在连接到服务器: ${serverIdentifier}`);
			}
			await this.mcpClientService.connectToServer(serverIdentifier, configPath);

			// 创建命令行接口
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});

			try {
				// 显示欢迎信息
				console.log('\n===============================');
				console.log('  MCP客户端已启动!');
				console.log("  输入您的问题或输入'quit'退出");
				console.log('===============================\n');

				// 主聊天循环
				while (true) {
					const message = await rl.question('\n问题: ');

					if (message.toLowerCase() === 'quit') {
						console.log('感谢使用MCP客户端，再见！');
						break;
					}

					if (!message.trim()) {
						console.log('请输入有效的问题');
						continue;
					}

					try {
						console.log('\n正在思考...');
						const response = await this.mcpClientService.processQuery(message);
						console.log('\n回答：');
						console.log(response);
					} catch (error) {
						console.error('\n处理查询失败:', error);
					}
				}
			} finally {
				rl.close();
				await this.mcpClientService.cleanup();
			}
		} catch (error) {
			console.error('初始化MCP客户端失败:', error);
			process.exit(1);
		}
	}
}
