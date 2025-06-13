import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as http from 'http';
import * as https from 'https';

export interface NetworkDiagnosticResult {
	service: string;
	status: 'success' | 'failed';
	message: string;
	responseTime?: number;
}

@Injectable()
export class NetworkDiagnosticService {
	private readonly logger = new Logger(NetworkDiagnosticService.name);

	constructor(private configService: ConfigService) {}
	/**
	 * 检查所有外部服务的网络连接状态
	 */
	async checkAllConnections(): Promise<NetworkDiagnosticResult[]> {
		const results: NetworkDiagnosticResult[] = [];

		// 检查 Pinecone 连接
		results.push(await this.checkPineconeConnection());

		return results;
	}

	/**
	 * 检查 Pinecone 服务连接
	 */
	private async checkPineconeConnection(): Promise<NetworkDiagnosticResult> {
		try {
			const startTime = Date.now();
			const apiKey = this.configService.get('PINECONE_API_KEY');

			if (!apiKey) {
				return {
					service: 'Pinecone',
					status: 'failed',
					message: 'PINECONE_API_KEY 未配置'
				};
			}

			// 尝试连接到 Pinecone API
			const response = await this.makeHttpRequest({
				hostname: 'controller.us-east-1.pinecone.io',
				port: 443,
				path: '/actions/whoami',
				method: 'GET',
				headers: {
					'Api-Key': apiKey
				}
			});

			const responseTime = Date.now() - startTime;

			if (response.statusCode === 200) {
				return {
					service: 'Pinecone',
					status: 'success',
					message: '连接成功',
					responseTime
				};
			} else {
				return {
					service: 'Pinecone',
					status: 'failed',
					message: `HTTP ${response.statusCode}: ${response.statusMessage}`
				};
			}
		} catch (error) {
			return {
				service: 'Pinecone',
				status: 'failed',
				message: this.getNetworkErrorMessage(error as Error)
			};
		}
	}

	/**
	 * 生成网络诊断报告
	 */
	async generateDiagnosticReport(): Promise<string> {
		const results = await this.checkAllConnections();

		let report = '\n=== 网络连接诊断报告 ===\n\n';

		results.forEach(result => {
			const status = result.status === 'success' ? '✅' : '❌';
			const responseTime = result.responseTime ? ` (${result.responseTime}ms)` : '';
			report += `${status} ${result.service}: ${result.message}${responseTime}\n`;
		});

		const failedServices = results.filter(r => r.status === 'failed');

		if (failedServices.length > 0) {
			report += '\n=== 建议的解决方案 ===\n\n';

			if (failedServices.some(s => s.service === '基本网络')) {
				report += '• 基本网络连接失败，请检查:\n';
				report += '  - 网络连接是否正常\n';
				report += '  - 防火墙设置\n';
				report += '  - 代理设置\n\n';
			}

			if (failedServices.some(s => s.service === 'Pinecone' || s.service === 'HuggingFace')) {
				report += '• 云服务连接失败，可能需要:\n';
				report += '  - 配置VPN (某些地区需要)\n';
				report += '  - 检查API密钥是否正确\n';
				report += '  - 检查服务状态页面\n\n';
			}
		} else {
			report += '\n✅ 所有网络连接正常！\n';
		}

		return report;
	}

	/**
	 * 发起HTTP请求
	 */
	private makeHttpRequest(options: any, useHttps: boolean = true): Promise<any> {
		return new Promise((resolve, reject) => {
			const client = useHttps ? https : http;

			const req = client.request(options, res => {
				resolve(res);
			});

			req.on('error', error => {
				reject(error);
			});

			req.setTimeout(10000, () => {
				req.destroy();
				reject(new Error('请求超时'));
			});

			req.end();
		});
	}

	/**
	 * 生成网络错误的用户友好消息
	 */
	private getNetworkErrorMessage(error: Error): string {
		const message = error.message;

		if (message.includes('ENOTFOUND')) {
			return '域名解析失败 - 请检查网络连接或DNS设置';
		} else if (message.includes('ECONNREFUSED')) {
			return '连接被拒绝 - 可能需要VPN或检查防火墙设置';
		} else if (message.includes('ETIMEDOUT') || message.includes('请求超时')) {
			return '连接超时 - 网络连接不稳定，建议使用VPN';
		} else if (message.includes('ECONNRESET')) {
			return '连接被重置 - 网络不稳定或被阻断';
		} else {
			return `网络错误: ${message}`;
		}
	}
}
