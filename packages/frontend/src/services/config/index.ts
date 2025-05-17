import { type RequestConfig, Requester } from './requester';
import type { ServerDataFormat } from './types';

const config: RequestConfig<unknown, ServerDataFormat> = {
	baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
	timeout: 10000,
	//这里设置实例拦截器
	reqOKFn: [
		config => {
			//添加token
			const token = localStorage.getItem('token');
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
