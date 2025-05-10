import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [tailwindcss(), react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@/services': path.resolve(__dirname, 'src/services')
		}
	}
});
