import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [tailwindcss(), react()],
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
			'@/utils': path.resolve(__dirname, 'src/utils')
		}
	}
});
