import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();

// import path from 'path';
// import { fileURLToPath } from 'url';
// // ESM 环境下获取 __dirname 
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const config = {
	typescript: {
		ignoreBuildErrors: true
	},
	/* monorepo中的standalone要么不可用，要么需要额外配置！！！ */
	// output: 'standalone',
	// 不起作用：
	// experimental: {
	// 	// 指定输出文件追踪的根目录为 monorepo 根目录
	// 	outputFileTracingRoot: path.resolve(__dirname, '../../'),
	// },
	/* 微前端 */
	// 解决主应用和微应用通信时的跨域问题
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{ key: 'Access-Control-Allow-Origin', value: '*' },
					{ key: 'Access-Control-Allow-Methods', value: '*' },
					{ key: 'Access-Control-Allow-Headers', value: '*' },
				]
			}
		];
	}
};

export default withNextIntl(config);
