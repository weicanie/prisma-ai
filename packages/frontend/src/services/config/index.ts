import type { ServerDataFormat } from '@prism-ai/shared';
import { type RequestConfig, Requester } from './requester';

const config: RequestConfig<unknown, ServerDataFormat> = {
	baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
	timeout: 100000,
	//这里设置实例拦截器
	reqOKFn: [
		config => {
			//添加token
			const token = localStorage.getItem('token');
			console.log('🚀 ~ token:', token);
			if (token && config.headers) {
				config.headers['Authorization'] = `Bearer ${token}`;
			}
			return config;
		}
	],
	resOKFn: [
		response => {
			return response;
		}
	]
};

const instance = new Requester<unknown, ServerDataFormat>(config);

export { instance };
