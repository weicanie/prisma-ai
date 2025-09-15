import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
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
					'react-query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools']
				}
			}
		}
	},
	// build: {
	// 	rollupOptions: {
	// 		output: {
	// 			manualChunks(id) {
	// 				// 将所有 node_modules 的包都拆分到独立的 chunk 中
	// 				if (id.includes('node_modules')) {
	// 					return id.toString().split('node_modules/')[1].split('/')[0].toString();
	// 				}
	// 			}
	// 		}
	// 	}
	// },
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
});
