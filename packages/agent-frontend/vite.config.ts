import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';
// https://vite.dev/config/
export default defineConfig({
	base: '/agent_frontend/',
	build: {
		outDir: 'dist-agent'
	},
	plugins: [vue(), vueDevTools(), tailwindcss()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	server: {
		cors: true,
		headers: {
			'Access-Control-Allow-Origin': '*'
		}
	}
});
