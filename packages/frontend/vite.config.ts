import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const isOnline = env.VITE_IS_ONLINE === 'true';
	return {
		plugins: [tailwindcss(), react()],
		// server: {
		// 	proxy: {
		// 		'/resume-editor': {
		// 			target: 'http://localhost:3009',
		// 			changeOrigin: true,
		// 			ws: true
		// 		}
		// 	}
		// },
		build: {
			outDir: isOnline ? 'dist-online' : 'dist',
			rollupOptions: {
				output: {
					manualChunks: {
						'react-vendor': ['react', 'react-dom', 'react-router-dom'],
						'antd-vendor': ['antd'],
						'antd-icon-vendor': ['@ant-design/icons'],
						'antd-x-vendor': ['@ant-design/x'],
						// 'copilotkit-core-vendor': ['@copilotkit/react-core'],
						// 'copilotkit-ui-vendor': ['@copilotkit/react-ui'],
						'milkdown-vendor': [
							'@milkdown/core',
							'@milkdown/react',
							'@milkdown/crepe',
							'@milkdown/preset-commonmark',
							'@milkdown/preset-gfm',
							'@milkdown/plugin-collab',
							'@milkdown/plugin-listener',
							'@milkdown/theme-nord',
							'@milkdown/utils',
							'@milkdown/ctx'
						],
						'radix-ui-vendor': [
							'@radix-ui/react-avatar',
							'@radix-ui/react-checkbox',
							'@radix-ui/react-collapsible',
							'@radix-ui/react-dialog',
							'@radix-ui/react-dropdown-menu',
							'@radix-ui/react-icons',
							'@radix-ui/react-label',
							'@radix-ui/react-popover',
							'@radix-ui/react-select',
							'@radix-ui/react-separator',
							'@radix-ui/react-slot',
							'@radix-ui/react-tabs',
							'@radix-ui/react-tooltip'
						],
						'react-query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
						'markmap-vendor': ['markmap-common', 'markmap-view', 'markmap-toolbar'],
						'markmap-vendor-2': ['markmap-lib'],
						'react-markdown-vendor': ['react-markdown', 'rehype-stringify', 'remark-gfm', 'shiki'],
						'react-markdown-plugin-vendor-1': ['rehype-raw'],
						'react-markdown-plugin-vendor-2': ['rehype-starry-night'],
						'react-markdown-plugin-vendor-3': ['remark-mermaid-plugin']
					}
				}
			}
		},
		define: {
			// 定义如何处理 Vue 的特性（Milkdown crepe编辑器依赖Vue）
			__VUE_OPTIONS_API__: true,
			__VUE_PROD_DEVTOOLS__: false,
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
		},
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
				'@/services': path.resolve(__dirname, 'src/services'),
				'@/components': path.resolve(__dirname, 'src/components'),
				'@/hooks': path.resolve(__dirname, 'src/hooks'),
				'@/assets': path.resolve(__dirname, 'src/assets'),
				'@/utils': path.resolve(__dirname, 'src/utils'),
				'@/shadcn-ui': path.resolve(__dirname, 'src/components/ui')
			}
		}
	};
});
